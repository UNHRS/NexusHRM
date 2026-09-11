import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/axiosInstance.js';
import DataTable from '../components/DataTable.jsx';
import Layout from '../components/Layout.jsx';
import { PageHeader, Stat } from '../components/Ui.jsx';

export default function Reports() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    api.get('/reports/overview').then((res) => setReport(res.data));
  }, []);

  if (!report) {
    return <Layout><PageHeader title="Reports" eyebrow="Loading" /></Layout>;
  }

  const attendanceRate = report.attendance.todayTotal
    ? Math.round((report.attendance.todayPresent / report.attendance.todayTotal) * 100)
    : 0;

  return (
    <Layout>
      <PageHeader title="Reports" eyebrow={`${report.scope.toLowerCase()} analytics`} actions={<Link className="btn btn-secondary" to="/reports/trends">View trends</Link>} />
      <div data-testid="reports-page" className="grid gap-4 md:grid-cols-4">
        <Stat label="Headcount" value={report.headcount} detail="Active employees" />
        <Stat label="Today attendance" value={`${attendanceRate}%`} detail={`${report.attendance.todayPresent}/${report.attendance.todayTotal} checked in`} />
        <Stat label="Pending leave" value={report.leave.pending} detail="Awaiting action" />
        <Stat label="Open jobs" value={report.recruitment.openJobs} detail={`${report.recruitment.totalCandidates} candidates`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <ReportTable title="Department Headcount" testId="department-report-table" data={report.departments} columns={['Department', 'Employees']} />
        <ReportTable title="Attendance Status" testId="attendance-report-table" data={report.attendance.status} columns={['Status', 'Records']} />
        <ReportTable title="Leave By Type" testId="leave-report-table" data={report.leave.byType} columns={['Leave type', 'Requests']} />
        <ReportTable title="Recruitment Stages" testId="recruitment-report-table" data={report.recruitment.byStage} columns={['Stage', 'Candidates']} />
      </div>
    </Layout>
  );
}

function ReportTable({ title, testId, data, columns }) {
  const rows = Object.entries(data || {}).map(([label, value]) => ({ label, value }));
  return (
    <section>
      <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">{title}</h2>
      <DataTable
        testId={testId}
        rows={rows}
        getKey={(row) => row.label}
        columns={[
          { key: 'label', label: columns[0] },
          { key: 'value', label: columns[1] }
        ]}
      />
    </section>
  );
}
