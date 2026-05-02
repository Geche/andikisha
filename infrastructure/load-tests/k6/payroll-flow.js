import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { BASE_URL, TENANT_EMAIL, TENANT_PASSWORD, TENANT_ID } from './config.js';

const payrollCalcDuration = new Trend('payroll_calc_duration_ms');
const payrollApprovalRate = new Rate('payroll_approval_success_rate');

export const options = {
    stages: [
        { duration: '30s', target: 5  },
        { duration: '2m',  target: 20 },
        { duration: '30s', target: 50 },
        { duration: '1m',  target: 50 },
        { duration: '30s', target: 0  },
    ],
    thresholds: {
        'http_req_duration': ['p(95)<2000'],
        'http_req_failed': ['rate<0.01'],
        'payroll_calc_duration_ms': ['p(95)<10000'],
        'payroll_approval_success_rate': ['rate>0.99'],
    },
};

function login() {
    const res = http.post(
        `${BASE_URL}/api/v1/auth/login`,
        JSON.stringify({ email: TENANT_EMAIL, password: TENANT_PASSWORD }),
        { headers: { 'Content-Type': 'application/json' } }
    );
    check(res, { 'login 200': (r) => r.status === 200 });
    return JSON.parse(res.body).accessToken;
}

export default function () {
    const token = login();
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': TENANT_ID,
    };

    // Step 1: Initiate payroll run for a unique period per VU to avoid duplicates
    const period = `2026-${String(__VU % 12 + 1).padStart(2, '0')}`;
    const runRes = http.post(
        `${BASE_URL}/api/v1/payroll/runs`,
        JSON.stringify({ period, payFrequency: 'MONTHLY' }),
        { headers }
    );
    if (!check(runRes, { 'payroll initiated': (r) => r.status === 201 })) return;
    const runId = JSON.parse(runRes.body).id;

    // Step 2: Calculate
    const calcStart = Date.now();
    const calcRes = http.post(`${BASE_URL}/api/v1/payroll/runs/${runId}/calculate`, null, { headers });
    payrollCalcDuration.add(Date.now() - calcStart);
    if (!check(calcRes, { 'payroll calculated': (r) => r.status === 200 })) return;

    // Step 3: Approve
    const approveRes = http.post(`${BASE_URL}/api/v1/payroll/runs/${runId}/approve`, null, { headers });
    const approved = check(approveRes, {
        'payroll approved': (r) => r.status === 200,
        'status is APPROVED': (r) => {
            try { return JSON.parse(r.body).status === 'APPROVED'; } catch { return false; }
        },
    });
    payrollApprovalRate.add(approved);

    // Step 4: Verify payslips
    const slipsRes = http.get(`${BASE_URL}/api/v1/payroll/runs/${runId}/payslips`, { headers });
    check(slipsRes, { 'payslips returned': (r) => r.status === 200 });

    sleep(1);
}
