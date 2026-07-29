import { Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../api/axiosInstance.js';
import DataTable from '../components/DataTable.jsx';
import Layout from '../components/Layout.jsx';
import { ErrorText, PageHeader, Stat, StatusBadge } from '../components/Ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const blankJob = { title: '', departmentId: '', location: 'Kathmandu', employmentType: 'FULL_TIME', status: 'OPEN', description: '' };
const blankCandidate = { fullName: '', email: '', phone: '', source: '', stage: 'APPLIED', jobOpeningId: '', notes: '' };

export default function Recruitment() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [summary, setSummary] = useState({});
  const [jobForm, setJobForm] = useState(blankJob);
  const [candidateForm, setCandidateForm] = useState(blankCandidate);
  const [error, setError] = useState('');

  async function load() {
    const [jobRes, candidateRes, deptRes, summaryRes] = await Promise.all([
      api.get('/recruitment/jobs'),
      api.get('/recruitment/candidates'),
      api.get('/departments'),
      api.get('/recruitment/summary')
    ]);
    setJobs(jobRes.data);
    setCandidates(candidateRes.data);
    setDepartments(deptRes.data);
    setSummary(summaryRes.data);
  }

  useEffect(() => { load(); }, []);

  function setJob(key, value) {
    setJobForm((current) => ({ ...current, [key]: value }));
  }

  function setCandidate(key, value) {
    setCandidateForm((current) => ({ ...current, [key]: value }));
  }

  async function createJob(event) {
    event.preventDefault();
    setError('');
    try {
      await api.post('/recruitment/jobs', { ...jobForm, departmentId: Number(jobForm.departmentId) });
      setJobForm(blankJob);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function createCandidate(event) {
    event.preventDefault();
    setError('');
    try {
      await api.post('/recruitment/candidates', { ...candidateForm, jobOpeningId: Number(candidateForm.jobOpeningId) });
      setCandidateForm(blankCandidate);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateCandidateStage(candidate, stage) {
    await api.put(`/recruitment/candidates/${candidate.id}`, { stage });
    await load();
  }

  async function updateJobStatus(job, status) {
    await api.put(`/recruitment/jobs/${job.id}`, { status });
    await load();
  }

  async function deleteJob(id) {
    if (!window.confirm('Delete this job and its candidates?')) return;
    await api.delete(`/recruitment/jobs/${id}`);
    await load();
  }

  return (
    <Layout>
      <PageHeader title="Recruitment" eyebrow="Hiring pipeline" />
      <div data-testid="recruitment-page" className="grid gap-4 md:grid-cols-4">
        <Stat label="Open jobs" value={summary.openJobs || 0} detail="Active requisitions" />
        <Stat label="Candidates" value={summary.totalCandidates || 0} detail="Total pipeline" />
        <Stat label="Interviews" value={summary.interviews || 0} detail="In progress" />
        <Stat label="Offers" value={summary.offers || 0} detail="Awaiting decision" />
      </div>

      <ErrorText message={error} />

      {user.role === 'ADMIN' && (
        <form data-testid="job-form" onSubmit={createJob} className="card mt-5 grid gap-3 p-4 md:grid-cols-6">
          <input className="field md:col-span-2" placeholder="Job title" value={jobForm.title} onChange={(e) => setJob('title', e.target.value)} required />
          <select className="field" value={jobForm.departmentId} onChange={(e) => setJob('departmentId', e.target.value)} required>
            <option value="">Department</option>
            {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
          </select>
          <input className="field" placeholder="Location" value={jobForm.location} onChange={(e) => setJob('location', e.target.value)} required />
          <select className="field" value={jobForm.employmentType} onChange={(e) => setJob('employmentType', e.target.value)}>
            <option>FULL_TIME</option>
            <option>PART_TIME</option>
            <option>CONTRACT</option>
            <option>INTERN</option>
          </select>
          <button className="btn btn-primary"><Plus size={16} /> Add job</button>
          <textarea className="field h-20 md:col-span-6" placeholder="Description" value={jobForm.description} onChange={(e) => setJob('description', e.target.value)} />
        </form>
      )}

      <form data-testid="candidate-form" onSubmit={createCandidate} className="card mt-5 grid gap-3 p-4 md:grid-cols-6">
        <input className="field" placeholder="Candidate name" value={candidateForm.fullName} onChange={(e) => setCandidate('fullName', e.target.value)} required />
        <input className="field" type="email" placeholder="Email" value={candidateForm.email} onChange={(e) => setCandidate('email', e.target.value)} required />
        <input className="field" placeholder="Phone" value={candidateForm.phone} onChange={(e) => setCandidate('phone', e.target.value)} />
        <input className="field" placeholder="Source" value={candidateForm.source} onChange={(e) => setCandidate('source', e.target.value)} />
        <select className="field" value={candidateForm.jobOpeningId} onChange={(e) => setCandidate('jobOpeningId', e.target.value)} required>
          <option value="">Job opening</option>
          {jobs.filter((job) => job.status !== 'CLOSED').map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}
        </select>
        <button className="btn btn-primary"><Plus size={16} /> Add candidate</button>
      </form>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <DataTable
          testId="job-table"
          rows={jobs}
          getKey={(row) => row.id}
          columns={[
            { key: 'title', label: 'Opening' },
            { key: 'department', label: 'Department', render: (row) => row.department?.name },
            { key: 'candidates', label: 'Candidates', render: (row) => row._count?.candidates || 0 },
            { key: 'status', label: 'Status', render: (row) => user.role === 'ADMIN' ? (
              <select className="field h-8" value={row.status} onChange={(e) => updateJobStatus(row, e.target.value)}>
                <option>OPEN</option>
                <option>ON_HOLD</option>
                <option>CLOSED</option>
              </select>
            ) : <StatusBadge value={row.status} /> },
            { key: 'actions', label: '', render: (row) => user.role === 'ADMIN' && <button className="btn btn-danger h-8" onClick={() => deleteJob(row.id)}><Trash2 size={14} /> Delete</button> }
          ]}
        />
        <DataTable
          testId="candidate-table"
          rows={candidates}
          getKey={(row) => row.id}
          columns={[
            { key: 'fullName', label: 'Candidate' },
            { key: 'job', label: 'Job', render: (row) => row.jobOpening?.title },
            { key: 'source', label: 'Source', render: (row) => row.source || '-' },
            { key: 'stage', label: 'Stage', render: (row) => (
              <select className="field h-8" value={row.stage} onChange={(e) => updateCandidateStage(row, e.target.value)}>
                <option>APPLIED</option>
                <option>SCREENING</option>
                <option>INTERVIEW</option>
                <option>OFFER</option>
                <option>HIRED</option>
                <option>REJECTED</option>
              </select>
            ) },
            { key: 'notes', label: 'Notes', render: (row) => row.notes || '-' }
          ]}
        />
      </div>
    </Layout>
  );
}
