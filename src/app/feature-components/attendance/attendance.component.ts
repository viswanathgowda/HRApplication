import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';

import { FirestoreService } from '../../firebase-services/firestore.service';
import { FireAuthService } from '../../firebase-services/fireauth.service';

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

  weeklyAttendance: any[] = [];
  monthlyAttendance: any[] = [];
  yearlyAttendance: any[] = [];

  constructor(
    private firestore: FirestoreService,
    private auth: FireAuthService
  ) {}

  ngOnInit(): void {
    this.fetchWeeklyAttendance();
    this.fetchYearlyAttendance();
  }

  fetchYearlyAttendance() {
    this.yearlyAttendance = [
      { name: 'January', present: 20, leaves: 2, holidays: 3, offs: 6 },
      { name: 'February', present: 18, leaves: 4, holidays: 2, offs: 4 },
      // Add other months...
    ];
  }

  fetchWeeklyAttendance() {
    const currentDay = this.today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const startOfWeek = new Date(
      this.today.setDate(this.today.getDate() - currentDay + 1)
    ); // Start of the week (Monday)
    this.weeklyAttendance = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return {
        date: new Date(date),
        status: this.getRandomStatus(), // Replace with real API logic
      };
    });
    console.log(this.weeklyAttendance);
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

    console.log(firstDayOfMonth, lastDayOfMonth);

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
    console.log(this.monthlyAttendance);
  }

  changeView(view: string) {
    if (view === 'weekly') {
      this.fetchWeeklyAttendance();
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
    const day = String(this.today.getDate()).padStart(2, '0');
    const formattedMonth = `${month}-${year}`;
    const formattedDay = `${day}-${month + 1}-${year}`;
    this.auth.getCurrentUser().then((user) => {
      this.firestore
        .getDoc(`attendance/${formattedMonth}/${user.uid}/${formattedDay}`)
        .subscribe((att) => {
          const time = att.signIn.toDate();
          const signIn = new Date(time).setHours(9, 0, 0, 0);
          const signOut =
            att.signOut?.toDate().getTime() || new Date().setHours(18, 0, 0, 0); // API-provided end time or default to 6 PM
          // this.rangeValues = [signIn, signOut]; // Default to full day

          console.log(att, time, signIn, signOut);
        });
    });
  }
}
