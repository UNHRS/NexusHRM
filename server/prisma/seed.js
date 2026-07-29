import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const passwordHash = await bcrypt.hash('password123', 10);

function daysAgo(days) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - days);
  return date;
}

function timeOn(date, hour, minute) {
  const value = new Date(date);
  value.setUTCHours(hour, minute, 0, 0);
  return value;
}

async function createEmployee({ user, employee }) {
  return prisma.employee.create({
    data: {
      ...employee,
      joiningDate: new Date(employee.joiningDate),
      user: {
        create: {
          username: user.username,
          passwordHash,
          role: user.role
        }
      }
    },
    include: { user: true }
  });
}

async function main() {
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Candidate", "JobOpening", "LeaveRequest", "Attendance", "User", "Employee", "Department" RESTART IDENTITY CASCADE');

  const recruitment = await prisma.department.create({ data: { name: 'Recruitment Operations' } });
  const documentation = await prisma.department.create({ data: { name: 'Documentation' } });
  const compliance = await prisma.department.create({ data: { name: 'Compliance Desk' } });

  const admin = await createEmployee({
    user: { username: 'admin', role: 'ADMIN' },
    employee: {
      fullName: 'Anish Shrestha',
      email: 'anish.shrestha@nexushrm.local',
      phone: '9801000001',
      designation: 'HR Director',
      joiningDate: '2022-01-10',
      departmentId: recruitment.id
    }
  });

  const managerA = await createEmployee({
    user: { username: 'manager.recruitment', role: 'MANAGER' },
    employee: {
      fullName: 'Srijana Karki',
      email: 'srijana.karki@nexushrm.local',
      phone: '9801000002',
      designation: 'Recruitment Manager',
      joiningDate: '2022-04-15',
      departmentId: recruitment.id,
      managerId: admin.id
    }
  });

  const managerB = await createEmployee({
    user: { username: 'manager.docs', role: 'MANAGER' },
    employee: {
      fullName: 'Rabin Adhikari',
      email: 'rabin.adhikari@nexushrm.local',
      phone: '9801000003',
      designation: 'Documentation Manager',
      joiningDate: '2022-06-01',
      departmentId: documentation.id,
      managerId: admin.id
    }
  });

  const employees = [];
  const employeeSpecs = [
    ['employee.aasha', 'Aasha Gurung', 'aasha.gurung@nexushrm.local', 'Talent Acquisition Associate', recruitment.id, managerA.id],
    ['employee.bibek', 'Bibek Maharjan', 'bibek.maharjan@nexushrm.local', 'Sourcing Specialist', recruitment.id, managerA.id],
    ['employee.mina', 'Mina Rai', 'mina.rai@nexushrm.local', 'Onboarding Coordinator', recruitment.id, managerA.id],
    ['employee.prakash', 'Prakash Thapa', 'prakash.thapa@nexushrm.local', 'Documentation Officer', documentation.id, managerB.id],
    ['employee.sabina', 'Sabina Lama', 'sabina.lama@nexushrm.local', 'Records Analyst', documentation.id, managerB.id],
    ['employee.niraj', 'Niraj Basnet', 'niraj.basnet@nexushrm.local', 'Compliance Assistant', compliance.id, managerB.id]
  ];

  for (const [username, fullName, email, designation, departmentId, managerId] of employeeSpecs) {
    employees.push(await createEmployee({
      user: { username, role: 'EMPLOYEE' },
      employee: {
        fullName,
        email,
        phone: `98010${employees.length + 10}`.padEnd(10, '0'),
        designation,
        joiningDate: '2023-02-01',
        departmentId,
        managerId
      }
    }));
  }

  const allEmployees = [admin, managerA, managerB, ...employees];
  for (const employee of allEmployees) {
    for (let offset = 13; offset >= 0; offset -= 1) {
      const date = daysAgo(offset);
      const weekday = date.getUTCDay();
      if (weekday === 0 || weekday === 6) continue;
      const late = (employee.id + offset) % 7 === 0;
      const absent = (employee.id + offset) % 19 === 0;
      await prisma.attendance.create({
        data: {
          employeeId: employee.id,
          date,
          checkIn: absent ? null : timeOn(date, late ? 4 : 3, late ? 35 : 55),
          checkOut: absent ? null : timeOn(date, 12, 15),
          status: absent ? 'ABSENT' : late ? 'LATE' : 'PRESENT'
        }
      });
    }
  }

  await prisma.leaveRequest.createMany({
    data: [
      {
        employeeId: employees[0].id,
        leaveType: 'ANNUAL',
        startDate: daysAgo(-4),
        endDate: daysAgo(-5),
        reason: 'Family function in Pokhara',
        status: 'PENDING'
      },
      {
        employeeId: employees[1].id,
        leaveType: 'SICK',
        startDate: daysAgo(3),
        endDate: daysAgo(2),
        reason: 'Medical appointment',
        status: 'APPROVED',
        approvedBy: managerA.id
      },
      {
        employeeId: employees[3].id,
        leaveType: 'CASUAL',
        startDate: daysAgo(-2),
        endDate: daysAgo(-2),
        reason: 'Personal errand',
        status: 'PENDING'
      },
      {
        employeeId: employees[4].id,
        leaveType: 'UNPAID',
        startDate: daysAgo(5),
        endDate: daysAgo(4),
        reason: 'Travel',
        status: 'REJECTED',
        approvedBy: managerB.id
      }
    ]
  });

  const recruiter = await prisma.jobOpening.create({
    data: {
      title: 'Senior Recruitment Specialist',
      departmentId: recruitment.id,
      location: 'Kathmandu',
      employmentType: 'FULL_TIME',
      status: 'OPEN',
      description: 'Lead sourcing, screening, and onboarding coordination for enterprise HR clients.'
    }
  });
  const records = await prisma.jobOpening.create({
    data: {
      title: 'Documentation Quality Analyst',
      departmentId: documentation.id,
      location: 'Lalitpur',
      employmentType: 'FULL_TIME',
      status: 'OPEN',
      description: 'Review employee files, verify compliance documents, and maintain audit-ready records.'
    }
  });
  await prisma.jobOpening.create({
    data: {
      title: 'Compliance Intern',
      departmentId: compliance.id,
      location: 'Hybrid',
      employmentType: 'INTERN',
      status: 'ON_HOLD',
      description: 'Support HR compliance reviews and checklist preparation.'
    }
  });

  await prisma.candidate.createMany({
    data: [
      { fullName: 'Asmita Khadka', email: 'asmita.khadka@example.com', phone: '9811000001', source: 'LinkedIn', stage: 'SCREENING', jobOpeningId: recruiter.id, notes: 'Strong sourcing background.' },
      { fullName: 'Kiran Poudel', email: 'kiran.poudel@example.com', phone: '9811000002', source: 'Referral', stage: 'INTERVIEW', jobOpeningId: recruiter.id, notes: 'Interview scheduled with Srijana.' },
      { fullName: 'Nisha Tamang', email: 'nisha.tamang@example.com', phone: '9811000003', source: 'Job portal', stage: 'APPLIED', jobOpeningId: records.id, notes: 'Needs document-control assessment.' },
      { fullName: 'Suman Bista', email: 'suman.bista@example.com', phone: '9811000004', source: 'Walk-in', stage: 'OFFER', jobOpeningId: records.id, notes: 'Offer draft pending.' }
    ]
  });

  console.log('Seed complete');
  console.log('Users: admin, manager.recruitment, manager.docs, employee.aasha, employee.bibek, employee.mina, employee.prakash, employee.sabina, employee.niraj');
  console.log('Password for all users: password123');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
