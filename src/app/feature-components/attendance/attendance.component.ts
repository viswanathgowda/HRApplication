import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

import { FirestoreService } from '../../firebase-services/firestore.service';
import { FireAuthService } from '../../firebase-services/fireauth.service';

interface Holiday {
  [key: string]: string; // Allows dynamic date keys with string values (holiday names)
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CalendarModule,
    TableModule,
    DropdownModule,
    TooltipModule,
    ButtonModule,
    TagModule,
  ],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css',
})
export class AttendanceComponent implements OnInit {
  today: Date = new Date();
  viewType: string = 'weekly';
  viewMonth: string = 'January';
  viewOptions = [
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
  ];

  days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  holidays: Holiday[] = [
    { '26-1-2025': 'Republic Day' }, // Republic Day
    { '15-8-2025': 'Independence Day' }, // Independence Day
    { '2-10-2025': 'Gandhi Jayanti' }, // Gandhi Jayanti
    { '14-4-2025': 'Ambedkar Jayanti' }, // Ambedkar Jayanti
    { '1-5-2025': 'Labour Day' }, // Labour Day
    { '15-8-2025': 'Assam State Day' }, // Assam State Day (Assam)
    { '19-10-2025': 'Dussehra' }, // Dussehra
    { '25-12-2025': 'Christmas Day' }, // Christmas Day
    { '14-1-2025': 'Makar Sankranti' }, // Makar Sankranti (may vary by region)
    { '7-8-2025': 'Raksha Bandhan' }, // Raksha Bandhan (may vary by region)
    { '16-2-2025': 'Maha Shivaratri' }, // Maha Shivaratri (may vary by region)
    { '8-3-2025': 'Holi' }, // Holi (may vary by region)
    { '23-11-2025': 'Diwali' }, // Diwali
    { '15-9-2025': 'Onam' }, // Onam (may vary by region)
    { '6-1-2025': 'Epiphany' }, // Epiphany (mainly for Christians)
    { '13-4-2025': 'Good Friday' }, // Good Friday (for Christians)
    { '20-7-2025': 'Eid-ul-Adha' }, // Eid-ul-Adha (Islamic festival, date varies)
    { '1-4-2025': 'Easter Sunday' }, // Easter Sunday (Christian festival)
  ];

  attendance: any[] = [];

  weeklyAttendance: any[] = [];
  monthlyAttendance: any[] = [];
  yearlyAttendance: any[] = [];

  isNextWeekAvl: boolean = false;

  constructor(
    private firestore: FirestoreService,
    private auth: FireAuthService
  ) {}

  ngOnInit(): void {
    this.getAttendance();
    this.fetchYearlyAttendance();
  }

  fetchYearlyAttendance() {
    this.yearlyAttendance = [
      { name: 'January', present: 20, leaves: 2, holidays: 3, offs: 6 },
      { name: 'February', present: 18, leaves: 4, holidays: 2, offs: 4 },
      // Add other months...
    ];
  }

  fetchWeeklyAttendance(
    data: any[] = this.attendance,
    date?: any,
    action?: string
  ) {
    const today =
      action && action?.includes('next')
        ? new Date(new Date(date).setDate(new Date(date).getDate() + 7))
        : action && action.includes('previous')
        ? date
        : new Date();

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      return this.formatDate(date);
    });

    const attendanceMap = new Map(data.map((item: any) => [item.docid, item]));

    this.weeklyAttendance = last7Days.map((date) => {
      const record = attendanceMap.get(date);
      const [day, month, year] = date.split('-').map(Number);
      return {
        date: new Date(year, month - 1, day),
        status: this.getAttendanceStatus(date, record),
        signIn: record?.signIn
          ? record.signIn.toDate().toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
          : null,
        signOut: record?.signOut
          ? record.signOut.toDate().toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
          : null,
        signInLocation: record?.signInLocation || null,
        signOutLocation: record?.signOutLocation || null,
      };
    });

    if (this.weeklyAttendance[0].date < new Date()) {
      this.isNextWeekAvl = false;
    } else {
      this.isNextWeekAvl = true;
    }
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1);
    const year = date.getFullYear();
    return `${day}-${month}-${year}`; // Format as `dd-mm-yyyy`
  }

  private getAttendanceStatus(date: string, record?: any): string {
    const today = new Date(date.split('-').reverse().join('-'));
    const signInDate = record ? this.formatDate(record.signIn.toDate()) : date;
    const isHoliday = this.holidays.find((holiday) =>
      holiday.hasOwnProperty(signInDate)
    );

    if (today.getDay() === 0) {
      return 'Off';
    } else if (isHoliday) {
      return `Holiday: ${isHoliday[signInDate]}`;
    }

    const currentTime = new Date().getTime();
    const signInTime = record ? record.signIn.toDate().getTime() : null;
    const diffInMilliseconds = currentTime - signInTime;
    const diff = diffInMilliseconds / (1000 * 60 * 60);

    if (record && record.signIn && record.signOut) {
      if (diff > 8) {
        return `Present - OverTime ${diff - 8}`;
      }
      if (diff === 4) {
        return 'Half-day';
      } else {
        return 'Present';
      }
    } else if (record && record.signIn && !record.signOut) {
      if (diff === 4) {
        return 'Half-day';
      } else if (diff > 8) {
        return 'Alert: sign out not found!';
      } else {
        return 'Working...';
      }
    }

    const currentHours = new Date().getHours();

    if (!record && today.getTime() !== new Date().getTime()) {
      return 'Absent';
    }

    if (!record && currentHours < 9) {
      return '';
    }

    return 'Data Not Found!';
  }

  prepareMonthlyAttendance() {
    const monthIndex = this.months.indexOf(this.viewMonth);
    const selectedMonth: Date = new Date(
      new Date().getFullYear(),
      monthIndex,
      1
    );
    const firstDayOfMonth = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth(),
      1
    );
    const lastDayOfMonth = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth() + 1,
      0
    );

    const daysInMonth = [];
    for (
      let date = new Date(firstDayOfMonth);
      date <= lastDayOfMonth;
      date.setDate(date.getDate() + 1)
    ) {
      daysInMonth.push({
        date: new Date(date),
        status: this.getRandomStatus(), // Replace with your real API data
      });
    }

    // Create weeks (rows) for the grid
    const weeks = [];
    let week: { date: Date; status: string }[] = [];
    daysInMonth.forEach((day, index) => {
      if (index % 7 === 0 && week.length) {
        weeks.push(week);
        week = [];
      }
      week.push(day);
    });
    if (week.length) weeks.push(week); // Add the last week

    this.monthlyAttendance = weeks;
  }

  changeView(view: string = 'weekly') {
    if (view === 'weekly') {
      this.fetchWeeklyAttendance(this.attendance);
    } else if (view === 'monthly') {
      this.prepareMonthlyAttendance();
    }
  }

  getRandomStatus(): string {
    const statuses = ['present', 'leave', 'holiday', 'off'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  getAttendance() {
    const month = this.today.getMonth(); // 0 = January, 1 = February, etc.
    const year = this.today.getFullYear();
    const formattedMonth = `${month}-${year}`;
    const day = String(this.today.getDate()).padStart(2, '0');
    const formattedDay = `${day}-${month + 1}-${year}`;
    this.auth.getCurrentUser().then((user) => {
      this.firestore
        .getCollection(`attendance/${formattedMonth}/${user.uid}`)
        .subscribe((att) => {
          // const time = att.signIn.toDate();
          // const signIn = new Date(time).setHours(9, 0, 0, 0);
          // const signOut =
          //   att.signOut?.toDate().getTime() || new Date().setHours(18, 0, 0, 0); // API-provided end time or default to 6 PM
          // this.rangeValues = [signIn, signOut]; // Default to full day
          this.attendance = att;
          this.fetchWeeklyAttendance(this.attendance);
        });
    });
  }
}
