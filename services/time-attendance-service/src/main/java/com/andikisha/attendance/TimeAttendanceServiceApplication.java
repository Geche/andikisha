package com.andikisha.attendance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.andikisha.attendance", "com.andikisha.common"})
public class TimeAttendanceServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(TimeAttendanceServiceApplication.class, args);
    }
}
