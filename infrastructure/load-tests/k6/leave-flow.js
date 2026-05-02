import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, TENANT_ID } from './config.js';

export const options = {
    vus: 50,
    duration: '2m',
    thresholds: {
        'http_req_duration': ['p(95)<1000'],
        'http_req_failed': ['rate<0.01'],
    },
};

function login(email, password) {
    const res = http.post(
        `${BASE_URL}/api/v1/auth/login`,
        JSON.stringify({ email, password }),
        { headers: { 'Content-Type': 'application/json' } }
    );
    const body = JSON.parse(res.body);
    return body.accessToken || '';
}

export default function () {
    const empEmail = `loadtest-emp-${__VU}@test.andikisha.com`;
    const token = login(empEmail, 'LoadTest@2026!');
    if (!token) return;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': TENANT_ID,
    };

    const startDate = '2026-07-01';
    const endDate   = '2026-07-05';

    const submitRes = http.post(
        `${BASE_URL}/api/v1/leave/requests`,
        JSON.stringify({
            leaveType: 'ANNUAL',
            startDate,
            endDate,
            days: 5,
            reason: 'Load test annual leave',
        }),
        { headers }
    );
    check(submitRes, {
        'leave submitted or conflict': (r) => [200, 201, 409, 422].includes(r.status),
    });

    sleep(0.5);
}
