import { useState, useEffect } from "react";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_CATEGORIES = [
  { id: 1, name: "Teaching & Learning", used: true },
  { id: 2, name: "Student Support", used: true },
  { id: 3, name: "Research", used: false },
  { id: 4, name: "Campus Facilities", used: true },
  { id: 5, name: "Digital Infrastructure", used: true },
  { id: 6, name: "Sustainability", used: false },
  { id: 7, name: "Wellbeing", used: true },
];

const MOCK_IDEAS = [
  {
    id: 1, title: "Peer Mentoring Programme for First-Years",
    body: "Establish a structured peer mentoring system pairing final-year students with incoming students to ease the transition to university life and improve retention rates.",
    author: "Dr. Sarah Mitchell", department: "Computer Science", anonymous: false,
    categories: [1, 7], votes: 24, views: 312, comments: 8,
    date: "2025-10-12", status: "open", hasVoted: null,
    attachments: ["mentoring_proposal.pdf"]
  },
  {
    id: 2, title: "24/7 Library Access for Postgraduates",
    body: "Extend library opening hours to 24/7 for postgraduate students during term time, particularly around dissertation submission periods.",
    author: "Anonymous", department: "Law", anonymous: true,
    categories: [4, 2], votes: 31, views: 445, comments: 12,
    date: "2025-10-15", status: "open", hasVoted: "up",
    attachments: []
  },
  {
    id: 3, title: "Centralised Research Equipment Booking",
    body: "Create a university-wide booking system for shared research equipment to reduce duplication of resources and improve departmental collaboration.",
    author: "Prof. James Okafor", department: "Engineering", anonymous: false,
    categories: [3, 5], votes: 18, views: 198, comments: 5,
    date: "2025-10-18", status: "open", hasVoted: null,
    attachments: ["equipment_audit.xlsx", "cost_analysis.pdf"]
  },
  {
    id: 4, title: "Green Rooftop Garden on Arts Building",
    body: "Transform the unused flat roof of the Arts Building into a green garden space for students and staff, supporting both sustainability goals and mental wellbeing.",
    author: "Anonymous", department: "Architecture", anonymous: true,
    categories: [6, 4, 7], votes: 42, views: 621, comments: 19,
    date: "2025-10-20", status: "open", hasVoted: null,
    attachments: []
  },
  {
    id: 5, title: "Unified Student Dashboard Portal",
    body: "Replace the fragmented collection of student portals (VLE, timetable, finance, library) with a single unified dashboard application.",
    author: "Dr. Priya Sharma", department: "Computer Science", anonymous: false,
    categories: [5, 1], votes: 56, views: 874, comments: 23,
    date: "2025-10-22", status: "open", hasVoted: "up",
    attachments: ["ux_wireframes.pdf"]
  },
  {
    id: 6, title: "Mental Health First Aid Training for All Staff",
    body: "Mandate Mental Health First Aid training for all academic and administrative staff to better support student wellbeing across the institution.",
    author: "Ms. Claire Thompson", department: "Human Resources", anonymous: false,
    categories: [7, 2], votes: -3, views: 134, comments: 3,
    date: "2025-10-25", status: "open", hasVoted: "down",
    attachments: []
  },
];

const MOCK_COMMENTS = [
  { id: 1, ideaId: 1, text: "Excellent idea – our department ran a similar scheme informally and outcomes were very positive.", author: "Anonymous", date: "2025-10-14", anonymous: true },
  { id: 2, ideaId: 1, text: "We need to ensure mentors receive proper training and support themselves.", author: "Dr. Lena Hoffmann", date: "2025-10-15", anonymous: false },
  { id: 3, ideaId: 2, text: "Security concerns need addressing first. Would require additional staffing costs.", author: "Anonymous", date: "2025-10-16", anonymous: true },
  { id: 4, ideaId: 5, text: "The current system is a nightmare. This would save so much time for students and staff alike.", author: "Prof. Ben Walsh", date: "2025-10-23", anonymous: false },
];

const STATS = {
  totalIdeas: 6, totalComments: 47, totalVotes: 168, totalViews: 2584,
  byDept: [
    { dept: "Computer Science", count: 2 },
    { dept: "Engineering", count: 1 },
    { dept: "Law", count: 1 },
    { dept: "Architecture", count: 1 },
    { dept: "Human Resources", count: 1 },
  ],
  byCategory: [
    { cat: "Teaching & Learning", count: 2 },
    { cat: "Student Support", count: 2 },
    { cat: "Digital Infrastructure", count: 2 },
    { cat: "Wellbeing", count: 3 },
    { cat: "Campus Facilities", count: 2 },
    { cat: "Research", count: 1 },
  ]
};

const USERS = [
  { id: 1, name: "Dr. Sarah Mitchell", role: "staff", dept: "Computer Science", email: "s.mitchell@uni.ac.uk" },
  { id: 2, name: "Ms. Claire Thompson", role: "qa_coordinator", dept: "Human Resources", email: "c.thompson@uni.ac.uk" },
  { id: 3, name: "Prof. David Harrison", role: "qa_manager", dept: "Quality Assurance", email: "d.harrison@uni.ac.uk" },
  { id: 4, name: "Mr. Tom Brady", role: "admin", dept: "IT Services", email: "t.brady@uni.ac.uk" },
];

// ─── Utility ──────────────────────────────────────────────────────────────────
const getCategoryById = (cats, id) => cats.find(c => c.id === id);
const formatDate = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

// ─── Icons (inline SVG) ───────────────────────────────────────────────────────
const Icon = ({ name, size = 16 }) => {
  const paths = {
    idea: "M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7zM9 21v-1h6v1a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z",
    comment: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
    thumb_up: "M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3",
    thumb_down: "M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm10-13h2.67A2.31 2.31 0 0 1 25 4v7a2.31 2.31 0 0 1-2.33 2H20",
    eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
    tag: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01",
    plus: "M12 5v14M5 12h14",
    trash: "M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",
    download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
    chart: "M18 20V10M12 20V4M6 20v-6",
    settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
    user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
    file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6",
    zip: "M10 2L8 6h2l-2 4h2l-3 6h3l-1 4h4l-1-4h3l-3-6h2l-2-4h2l-2-4z",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
    bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    check: "M20 6L9 17l-5-5",
    x: "M18 6L6 18M6 6l12 12",
    upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
    alert: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
    lock: "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4",
    grid: "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z",
    award: "M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M8.21 13.89L7 23l5-3 5 3-1.21-9.12",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name] || ""} />
    </svg>
  );
};

// ─── Style ────────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy: #0f1e36;
    --navy-2: #1a2f4e;
    --navy-3: #243d63;
    --gold: #c9a84c;
    --gold-light: #e8c97a;
    --gold-pale: #f5eddb;
    --cream: #faf7f2;
    --white: #ffffff;
    --text: #1a2035;
    --text-2: #4a5568;
    --text-3: #8896a5;
    --border: #dde4ec;
    --red: #c0392b;
    --green: #1a7340;
    --blue: #1a4f8a;
    --shadow: 0 2px 12px rgba(15,30,54,0.08);
    --shadow-md: 0 4px 24px rgba(15,30,54,0.12);
    --shadow-lg: 0 8px 40px rgba(15,30,54,0.16);
    --radius: 10px;
  }

  body { font-family: 'IBM Plex Sans', sans-serif; background: var(--cream); color: var(--text); }

  .app { min-height: 100vh; display: flex; flex-direction: column; }

  /* NAV */
  .nav {
    background: var(--navy);
    color: white;
    padding: 0 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 20px rgba(0,0,0,0.25);
  }
  .nav-brand { display: flex; align-items: center; gap: 0.75rem; }
  .nav-logo {
    width: 36px; height: 36px;
    background: var(--gold);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif;
    font-weight: 700; font-size: 18px; color: var(--navy);
  }
  .nav-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 600; }
  .nav-subtitle { font-size: 0.7rem; color: rgba(255,255,255,0.5); letter-spacing: 0.08em; text-transform: uppercase; }
  .nav-actions { display: flex; align-items: center; gap: 1rem; }
  .nav-user { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: rgba(255,255,255,0.8); }
  .role-badge {
    font-size: 0.65rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
    padding: 2px 8px; border-radius: 20px; background: var(--gold); color: var(--navy);
  }
  .btn-ghost { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.7); padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; gap: 0.4rem; transition: all 0.2s; }
  .btn-ghost:hover { background: rgba(255,255,255,0.1); color: white; border-color: rgba(255,255,255,0.4); }

  /* SIDEBAR */
  .layout { display: flex; flex: 1; }
  .sidebar {
    width: 220px; min-width: 220px;
    background: var(--white);
    border-right: 1px solid var(--border);
    padding: 1.5rem 0;
    display: flex; flex-direction: column;
    gap: 0.25rem;
  }
  .sidebar-section { padding: 0.5rem 1rem 0.25rem; font-size: 0.65rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-3); }
  .nav-item {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem; font-weight: 500; color: var(--text-2);
    cursor: pointer; transition: all 0.15s;
    border-left: 3px solid transparent;
  }
  .nav-item:hover { background: var(--gold-pale); color: var(--navy); }
  .nav-item.active { background: var(--gold-pale); color: var(--navy); border-left-color: var(--gold); font-weight: 600; }
  .nav-item svg { opacity: 0.7; }
  .nav-item.active svg { opacity: 1; }

  /* MAIN */
  .main { flex: 1; padding: 2rem; overflow-y: auto; min-width: 0; }

  /* PAGE HEADER */
  .page-header { margin-bottom: 1.75rem; }
  .page-title { font-family: 'Playfair Display', serif; font-size: 1.75rem; font-weight: 700; color: var(--navy); }
  .page-sub { font-size: 0.9rem; color: var(--text-2); margin-top: 0.25rem; }

  /* CARDS */
  .card { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); }
  .card-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
  .card-title { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 600; color: var(--navy); }
  .card-body { padding: 1.5rem; }

  /* BUTTONS */
  .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.55rem 1.1rem; border-radius: 7px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; font-family: inherit; }
  .btn-primary { background: var(--navy); color: white; }
  .btn-primary:hover { background: var(--navy-2); transform: translateY(-1px); box-shadow: var(--shadow-md); }
  .btn-gold { background: var(--gold); color: var(--navy); }
  .btn-gold:hover { background: var(--gold-light); transform: translateY(-1px); }
  .btn-outline { background: transparent; border: 1.5px solid var(--border); color: var(--text-2); }
  .btn-outline:hover { border-color: var(--navy); color: var(--navy); background: var(--gold-pale); }
  .btn-danger { background: var(--red); color: white; }
  .btn-danger:hover { background: #a93226; }
  .btn-sm { padding: 0.35rem 0.75rem; font-size: 0.78rem; }
  .btn-icon { padding: 0.4rem; border-radius: 6px; background: transparent; border: 1.5px solid var(--border); color: var(--text-2); cursor: pointer; display: inline-flex; transition: all 0.15s; }
  .btn-icon:hover { background: var(--gold-pale); border-color: var(--gold); color: var(--navy); }

  /* VOTE BUTTONS */
  .vote-btn { display: flex; align-items: center; gap: 0.3rem; padding: 0.35rem 0.75rem; border-radius: 20px; border: 1.5px solid var(--border); font-size: 0.8rem; font-weight: 600; cursor: pointer; background: white; transition: all 0.2s; }
  .vote-btn.up:hover, .vote-btn.up.active { background: #e8f5e9; border-color: var(--green); color: var(--green); }
  .vote-btn.down:hover, .vote-btn.down.active { background: #fdecea; border-color: var(--red); color: var(--red); }

  /* IDEA CARD */
  .idea-card {
    background: var(--white); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 1.5rem;
    transition: all 0.2s; cursor: pointer;
    border-left: 4px solid transparent;
  }
  .idea-card:hover { box-shadow: var(--shadow-md); border-left-color: var(--gold); transform: translateY(-1px); }
  .idea-title { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 600; color: var(--navy); margin-bottom: 0.5rem; }
  .idea-excerpt { font-size: 0.875rem; color: var(--text-2); line-height: 1.6; margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .idea-meta { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; font-size: 0.78rem; color: var(--text-3); }
  .idea-meta strong { color: var(--text-2); font-weight: 600; }
  .idea-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.75rem; }
  .tag { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.04em; padding: 3px 10px; border-radius: 20px; background: var(--gold-pale); color: var(--navy-2); border: 1px solid #e8d9b4; }
  .idea-stats { display: flex; gap: 1rem; align-items: center; }
  .stat-item { display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; color: var(--text-2); }
  .score-pos { color: var(--green); font-weight: 700; }
  .score-neg { color: var(--red); font-weight: 700; }
  .score-neutral { color: var(--text-3); font-weight: 600; }

  /* FORM */
  .form-group { margin-bottom: 1.25rem; }
  .form-label { display: block; font-size: 0.8rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--text-2); margin-bottom: 0.5rem; }
  .form-input, .form-select, .form-textarea {
    width: 100%; padding: 0.65rem 0.9rem;
    border: 1.5px solid var(--border); border-radius: 7px;
    font-size: 0.875rem; font-family: inherit; color: var(--text);
    background: var(--white); transition: border 0.2s;
    outline: none;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,168,76,0.15); }
  .form-textarea { min-height: 120px; resize: vertical; line-height: 1.6; }
  .checkbox-group { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .checkbox-item { display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.8rem; border: 1.5px solid var(--border); border-radius: 6px; cursor: pointer; font-size: 0.82rem; font-weight: 500; transition: all 0.15s; user-select: none; }
  .checkbox-item:hover { background: var(--gold-pale); border-color: var(--gold); }
  .checkbox-item.selected { background: var(--gold-pale); border-color: var(--gold); color: var(--navy); }
  .anonymous-toggle { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; background: var(--cream); border-radius: 8px; border: 1.5px solid var(--border); cursor: pointer; font-size: 0.85rem; font-weight: 500; }
  .toggle { width: 40px; height: 22px; background: var(--border); border-radius: 20px; position: relative; transition: background 0.2s; }
  .toggle.on { background: var(--navy); }
  .toggle::after { content: ''; position: absolute; width: 16px; height: 16px; background: white; border-radius: 50%; top: 3px; left: 3px; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
  .toggle.on::after { transform: translateX(18px); }

  /* MODAL */
  .modal-overlay { position: fixed; inset: 0; background: rgba(15,30,54,0.55); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; }
  .modal { background: var(--white); border-radius: 14px; width: 100%; max-width: 680px; max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-lg); }
  .modal-header { padding: 1.5rem 1.75rem 1.25rem; border-bottom: 1px solid var(--border); display: flex; align-items: flex-start; justify-content: space-between; }
  .modal-title { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 700; color: var(--navy); }
  .modal-body { padding: 1.75rem; }
  .modal-footer { padding: 1rem 1.75rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 0.75rem; }

  /* GRID */
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }

  /* STAT CARD */
  .stat-card { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.25rem 1.5rem; }
  .stat-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-3); margin-bottom: 0.5rem; }
  .stat-value { font-family: 'IBM Plex Mono', monospace; font-size: 2rem; font-weight: 500; color: var(--navy); line-height: 1; }
  .stat-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
  .si-gold { background: var(--gold-pale); color: var(--gold); }
  .si-navy { background: #e8edf5; color: var(--navy); }
  .si-green { background: #e8f5e9; color: var(--green); }
  .si-red { background: #fdecea; color: var(--red); }

  /* TABS */
  .tabs { display: flex; border-bottom: 2px solid var(--border); margin-bottom: 1.5rem; gap: 0; }
  .tab { padding: 0.75rem 1.25rem; font-size: 0.875rem; font-weight: 600; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; color: var(--text-3); transition: all 0.15s; display: flex; align-items: center; gap: 0.5rem; }
  .tab:hover { color: var(--navy); }
  .tab.active { color: var(--navy); border-bottom-color: var(--gold); }

  /* TABLE */
  .table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
  .table th { padding: 0.75rem 1rem; text-align: left; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-3); border-bottom: 2px solid var(--border); background: var(--cream); }
  .table td { padding: 0.875rem 1rem; border-bottom: 1px solid var(--border); color: var(--text-2); vertical-align: middle; }
  .table tr:hover td { background: var(--gold-pale); }
  .table tr:last-child td { border-bottom: none; }

  /* ALERT */
  .alert { padding: 0.875rem 1rem; border-radius: 8px; font-size: 0.875rem; display: flex; align-items: flex-start; gap: 0.75rem; }
  .alert-info { background: #e8edf5; border: 1px solid #c5d3e8; color: var(--navy-2); }
  .alert-warning { background: #fff8e8; border: 1px solid #f0dea0; color: #7d5a00; }
  .alert-success { background: #e8f5e9; border: 1px solid #a8d5b0; color: var(--green); }

  /* PAGINATION */
  .pagination { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 1.25rem 0 0; }
  .page-btn { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; border: 1.5px solid var(--border); border-radius: 6px; cursor: pointer; font-size: 0.875rem; font-weight: 600; color: var(--text-2); background: white; transition: all 0.15s; }
  .page-btn:hover { border-color: var(--gold); color: var(--navy); background: var(--gold-pale); }
  .page-btn.active { background: var(--navy); color: white; border-color: var(--navy); }

  /* LOGIN */
  .login-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--navy); padding: 2rem; }
  .login-card { background: var(--white); border-radius: 16px; width: 100%; max-width: 440px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.4); }
  .login-header { background: var(--navy-2); padding: 2rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); }
  .login-logo { width: 56px; height: 56px; background: var(--gold); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-weight: 700; font-size: 28px; color: var(--navy); margin: 0 auto 1rem; }
  .login-title { font-family: 'Playfair Display', serif; color: white; font-size: 1.35rem; }
  .login-sub { color: rgba(255,255,255,0.5); font-size: 0.8rem; margin-top: 0.3rem; }
  .login-body { padding: 2rem; }
  .user-selector { display: grid; gap: 0.5rem; margin-bottom: 1.5rem; }
  .user-option { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border: 1.5px solid var(--border); border-radius: 8px; cursor: pointer; transition: all 0.15s; }
  .user-option:hover { border-color: var(--gold); background: var(--gold-pale); }
  .user-option.selected { border-color: var(--navy); background: #e8edf5; }
  .user-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; color: white; flex-shrink: 0; }
  .av-staff { background: var(--blue); }
  .av-coord { background: var(--green); }
  .av-manager { background: #7b2d8b; }
  .av-admin { background: var(--red); }

  /* UPLOAD ZONE */
  .upload-zone { border: 2px dashed var(--border); border-radius: 8px; padding: 1.5rem; text-align: center; cursor: pointer; transition: all 0.2s; font-size: 0.875rem; color: var(--text-3); }
  .upload-zone:hover { border-color: var(--gold); background: var(--gold-pale); color: var(--text-2); }

  /* BAR CHART */
  .bar-chart { display: flex; flex-direction: column; gap: 0.75rem; }
  .bar-row { display: flex; align-items: center; gap: 0.75rem; font-size: 0.82rem; }
  .bar-label { width: 160px; flex-shrink: 0; color: var(--text-2); font-weight: 500; }
  .bar-track { flex: 1; height: 20px; background: var(--cream); border-radius: 4px; overflow: hidden; }
  .bar-fill { height: 100%; background: linear-gradient(to right, var(--navy), var(--navy-3)); border-radius: 4px; transition: width 0.6s ease; }
  .bar-count { width: 24px; text-align: right; font-weight: 700; color: var(--navy); font-family: 'IBM Plex Mono', monospace; font-size: 0.85rem; }

  /* T&C */
  .terms-box { max-height: 200px; overflow-y: auto; font-size: 0.82rem; line-height: 1.7; color: var(--text-2); padding: 1rem; background: var(--cream); border-radius: 8px; border: 1px solid var(--border); margin-bottom: 1rem; }

  /* COMMENT */
  .comment { padding: 1rem; border: 1px solid var(--border); border-radius: 8px; background: var(--cream); margin-bottom: 0.75rem; }
  .comment-author { font-size: 0.8rem; font-weight: 600; color: var(--navy); }
  .comment-date { font-size: 0.74rem; color: var(--text-3); margin-left: 0.5rem; }
  .comment-body { font-size: 0.875rem; color: var(--text-2); line-height: 1.6; margin-top: 0.4rem; }

  /* BANNER */
  .hero-banner {
    background: linear-gradient(135deg, var(--navy) 0%, var(--navy-3) 100%);
    border-radius: var(--radius);
    padding: 2rem 2.5rem;
    margin-bottom: 2rem;
    position: relative;
    overflow: hidden;
    color: white;
  }
  .hero-banner::before {
    content: '';
    position: absolute; top: -40px; right: -40px;
    width: 220px; height: 220px;
    background: var(--gold); opacity: 0.08;
    border-radius: 50%;
  }
  .hero-banner::after {
    content: '';
    position: absolute; bottom: -60px; right: 80px;
    width: 160px; height: 160px;
    background: var(--gold-light); opacity: 0.06;
    border-radius: 50%;
  }

  /* DIVIDER */
  .divider { border: none; border-top: 1px solid var(--border); margin: 1.5rem 0; }

  /* RESPONSIVE */
  @media (max-width: 768px) {
    .sidebar { display: none; }
    .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
    .main { padding: 1rem; }
    .idea-stats { flex-wrap: wrap; }
  }
  @media (max-width: 1024px) {
    .grid-3 { grid-template-columns: 1fr 1fr; }
    .grid-4 { grid-template-columns: 1fr 1fr; }
  }

  /* IDEA DETAIL */
  .idea-detail-header { padding: 1.75rem; border-bottom: 1px solid var(--border); }
  .idea-detail-body { padding: 1.75rem; font-size: 0.9rem; line-height: 1.8; color: var(--text-2); }
  .attachment-chip { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.35rem 0.75rem; border: 1.5px solid var(--border); border-radius: 6px; font-size: 0.78rem; font-weight: 500; color: var(--text-2); background: var(--cream); cursor: pointer; }
  .attachment-chip:hover { border-color: var(--navy); color: var(--navy); }

  /* CATEGORY PILL */
  .category-row { display: flex; align-items: center; justify-content: space-between; padding: 0.625rem 0; border-bottom: 1px solid var(--border); }
  .category-row:last-child { border-bottom: none; }

  /* TIMELINE badge */
  .closure-bar { display: flex; flex-direction: column; gap: 0.5rem; }
  .closure-item { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; background: var(--cream); border-radius: 8px; border: 1px solid var(--border); font-size: 0.85rem; }
  .closure-label { font-weight: 600; color: var(--navy); }
  .closure-date { font-family: 'IBM Plex Mono', monospace; font-size: 0.8rem; color: var(--text-2); }
  .badge-open { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; background: #e8f5e9; color: var(--green); }
  .badge-closed { background: #fdecea; color: var(--red); display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
  .badge-pending { background: #fff8e8; color: #7d5a00; display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }

  .empty-state { text-align: center; padding: 3rem; color: var(--text-3); }
  .empty-state p { font-size: 0.9rem; margin-top: 0.5rem; }

  .search-bar { position: relative; }
  .search-bar input { padding-left: 2.25rem; }
  .search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-3); pointer-events: none; }

  .filter-bar { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.25rem; align-items: center; }
`;

// ─── Components ───────────────────────────────────────────────────────────────

function Pagination({ total, perPage = 5, page, setPage }) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  return (
    <div className="pagination">
      {Array.from({ length: pages }, (_, i) => (
        <div key={i} className={`page-btn ${page === i ? "active" : ""}`} onClick={() => setPage(i)}>{i + 1}</div>
      ))}
    </div>
  );
}

function IdeaCard({ idea, categories, onClick }) {
  const score = idea.votes;
  return (
    <div className="idea-card" onClick={() => onClick(idea)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
        <div className="idea-title">{idea.title}</div>
        <span className={`badge-${idea.status === "open" ? "open" : "closed"}`} style={{ marginLeft: "0.75rem", flexShrink: 0 }}>{idea.status}</span>
      </div>
      <div className="idea-tags">
        {idea.categories.map(cid => {
          const cat = getCategoryById(categories, cid);
          return cat ? <span key={cid} className="tag">{cat.name}</span> : null;
        })}
      </div>
      <p className="idea-excerpt">{idea.body}</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
        <div className="idea-meta">
          <strong>{idea.anonymous ? "Anonymous" : idea.author}</strong>
          <span>·</span>
          <span>{idea.department}</span>
          <span>·</span>
          <span>{formatDate(idea.date)}</span>
          {idea.attachments.length > 0 && <><span>·</span><span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}><Icon name="file" size={12} />{idea.attachments.length}</span></>}
        </div>
        <div className="idea-stats">
          <span className={`stat-item ${score > 0 ? "score-pos" : score < 0 ? "score-neg" : "score-neutral"}`}>
            <Icon name="thumb_up" size={13} /> {score > 0 ? "+" : ""}{score}
          </span>
          <span className="stat-item"><Icon name="eye" size={13} /> {idea.views}</span>
          <span className="stat-item"><Icon name="comment" size={13} /> {idea.comments}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Views ────────────────────────────────────────────────────────────────────

function IdeasView({ ideas, categories, currentUser }) {
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState("latest");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const PER_PAGE = 5;

  const sorted = [...ideas]
    .filter(i => filter === "all" || i.categories.includes(parseInt(filter)))
    .filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.body.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "popular") return b.votes - a.votes;
      if (sort === "views") return b.views - a.views;
      if (sort === "comments") return b.comments - a.comments;
      return new Date(b.date) - new Date(a.date);
    });

  const paged = sorted.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <div>
      <div className="hero-banner">
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: "0.5rem" }}>Quality Assurance · Ideas Portal</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>Share Your Ideas</h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", maxWidth: "480px", lineHeight: 1.6 }}>Help shape the future of our university. Submit your ideas for improvement and see what your colleagues are proposing.</p>
          <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button className="btn btn-gold" onClick={() => setShowSubmit(true)}><Icon name="plus" size={15} /> Submit an Idea</button>
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>
              <span><strong style={{ color: "var(--gold-light)" }}>{ideas.length}</strong> ideas submitted</span>
              <span><strong style={{ color: "var(--gold-light)" }}>47</strong> comments</span>
              <span><strong style={{ color: "var(--gold-light)" }}>168</strong> votes cast</span>
            </div>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-bar" style={{ flex: 1, minWidth: "200px" }}>
          <span className="search-icon"><Icon name="eye" size={15} /></span>
          <input className="form-input" placeholder="Search ideas…" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} style={{ paddingLeft: "2.25rem" }} />
        </div>
        <select className="form-select" style={{ width: "auto" }} value={sort} onChange={e => setSort(e.target.value)}>
          <option value="latest">Latest Ideas</option>
          <option value="popular">Most Popular</option>
          <option value="views">Most Viewed</option>
          <option value="comments">Most Commented</option>
        </select>
        <select className="form-select" style={{ width: "auto" }} value={filter} onChange={e => { setFilter(e.target.value); setPage(0); }}>
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
        {paged.length === 0 ? (
          <div className="empty-state"><Icon name="idea" size={32} /><p>No ideas found matching your criteria.</p></div>
        ) : paged.map(idea => (
          <IdeaCard key={idea.id} idea={idea} categories={categories} onClick={setSelectedIdea} />
        ))}
      </div>
      <Pagination total={sorted.length} perPage={PER_PAGE} page={page} setPage={setPage} />

      {selectedIdea && <IdeaDetailModal idea={selectedIdea} categories={categories} comments={MOCK_COMMENTS} onClose={() => setSelectedIdea(null)} />}
      {showSubmit && <SubmitIdeaModal categories={categories} onClose={() => setShowSubmit(false)} />}
    </div>
  );
}

function IdeaDetailModal({ idea, categories, comments, onClose }) {
  const [newComment, setNewComment] = useState("");
  const [anonComment, setAnonComment] = useState(false);
  const [voted, setVoted] = useState(idea.hasVoted);
  const ideaComments = comments.filter(c => c.ideaId === idea.id);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: "720px" }}>
        <div className="modal-header">
          <div>
            <div className="idea-tags" style={{ marginBottom: "0.5rem" }}>
              {idea.categories.map(cid => {
                const cat = getCategoryById(categories, cid);
                return cat ? <span key={cid} className="tag">{cat.name}</span> : null;
              })}
            </div>
            <div className="modal-title">{idea.title}</div>
            <div className="idea-meta" style={{ marginTop: "0.4rem" }}>
              <strong>{idea.anonymous ? "Anonymous" : idea.author}</strong>
              <span>·</span><span>{idea.department}</span>
              <span>·</span><span>{formatDate(idea.date)}</span>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>

        <div className="idea-detail-body">
          <p>{idea.body}</p>
          {idea.attachments.length > 0 && (
            <div style={{ marginTop: "1.25rem" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-3)", marginBottom: "0.5rem" }}>Attachments</div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {idea.attachments.map((f, i) => <span key={i} className="attachment-chip"><Icon name="file" size={13} />{f}</span>)}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: "0 1.75rem", paddingBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", background: "var(--cream)", borderRadius: "8px", border: "1px solid var(--border)" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-2)" }}>Cast your vote:</span>
            <button className={`vote-btn up ${voted === "up" ? "active" : ""}`} onClick={() => setVoted(voted === "up" ? null : "up")}>
              <Icon name="thumb_up" size={14} /> Thumbs Up
            </button>
            <button className={`vote-btn down ${voted === "down" ? "active" : ""}`} onClick={() => setVoted(voted === "down" ? null : "down")}>
              <Icon name="thumb_down" size={14} /> Thumbs Down
            </button>
            <span style={{ marginLeft: "auto", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, color: idea.votes > 0 ? "var(--green)" : idea.votes < 0 ? "var(--red)" : "var(--text-3)" }}>
              {idea.votes > 0 ? "+" : ""}{idea.votes} score
            </span>
          </div>
        </div>

        <div style={{ padding: "0 1.75rem 1.75rem" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: "1rem", color: "var(--navy)", marginBottom: "1rem" }}>
            Comments ({ideaComments.length})
          </div>
          {ideaComments.map(c => (
            <div key={c.id} className="comment">
              <span className="comment-author">{c.anonymous ? "Anonymous" : c.author}</span>
              <span className="comment-date">{formatDate(c.date)}</span>
              <p className="comment-body">{c.text}</p>
            </div>
          ))}
          <div style={{ marginTop: "1rem" }}>
            <div className="form-label">Add a Comment</div>
            <textarea className="form-textarea" style={{ minHeight: "80px", marginBottom: "0.75rem" }} placeholder="Share your thoughts…" value={newComment} onChange={e => setNewComment(e.target.value)} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div className="anonymous-toggle" onClick={() => setAnonComment(!anonComment)} style={{ cursor: "pointer" }}>
                <div className={`toggle ${anonComment ? "on" : ""}`} />
                <span style={{ fontSize: "0.82rem" }}>Post anonymously</span>
              </div>
              <button className="btn btn-primary btn-sm" disabled={!newComment.trim()}>Post Comment</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubmitIdeaModal({ categories, onClose }) {
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedCats, setSelectedCats] = useState([]);
  const [anon, setAnon] = useState(false);

  const toggleCat = (id) => setSelectedCats(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--gold)", marginBottom: "0.25rem" }}>Step {step} of 3</div>
            <div className="modal-title">
              {step === 1 ? "Terms & Conditions" : step === 2 ? "Your Idea" : "Review & Submit"}
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}><Icon name="x" /></button>
        </div>

        <div className="modal-body">
          {step === 1 && (
            <div>
              <div className="alert alert-info" style={{ marginBottom: "1rem" }}>
                <Icon name="shield" size={16} />
                <span>Please read and agree to our Terms & Conditions before submitting an idea.</span>
              </div>
              <div className="terms-box">
                <strong>University Ideas for Improvement — Terms & Conditions</strong><br /><br />
                1. <strong>Participation</strong> — All current staff of the University are eligible to submit ideas. By submitting an idea you confirm you are a current member of staff.<br /><br />
                2. <strong>Anonymous submissions</strong> — You may submit ideas and comments anonymously. However, your identity will be stored securely in the database. Anonymous status only affects public display. In cases of inappropriate content, stored identity information may be used for investigation purposes.<br /><br />
                3. <strong>Content standards</strong> — All ideas and comments must be respectful, constructive, and relevant to university improvement. Content that is offensive, discriminatory, defamatory, or otherwise inappropriate will be removed without notice.<br /><br />
                4. <strong>Data protection</strong> — Your submitted data will be processed in accordance with the University's Data Protection Policy and UK GDPR. Data may be retained for up to 3 years after the closure of the submissions period.<br /><br />
                5. <strong>Ownership</strong> — Ideas submitted become the intellectual property of the University for the purposes of quality assurance and improvement planning.<br /><br />
                6. <strong>Closure dates</strong> — New ideas may only be submitted until the Ideas Closure Date. Comments may continue to be posted until the Final Closure Date.
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", fontSize: "0.875rem", fontWeight: 500 }}>
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ width: "16px", height: "16px", accentColor: "var(--navy)" }} />
                I have read and agree to the Terms & Conditions
              </label>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="form-group">
                <label className="form-label">Idea Title *</label>
                <input className="form-input" placeholder="A concise, descriptive title…" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-textarea" style={{ minHeight: "140px" }} placeholder="Describe your idea in detail. What is the problem? What is your proposed solution? What benefits would it bring?" value={body} onChange={e => setBody(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Categories</label>
                <div className="checkbox-group">
                  {categories.map(cat => (
                    <div key={cat.id} className={`checkbox-item ${selectedCats.includes(cat.id) ? "selected" : ""}`} onClick={() => toggleCat(cat.id)}>
                      <Icon name="tag" size={12} /> {cat.name}
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Supporting Documents (Optional)</label>
                <div className="upload-zone">
                  <Icon name="upload" size={20} />
                  <div style={{ marginTop: "0.5rem" }}>Drag & drop files here, or click to browse</div>
                  <div style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>PDF, Word, Excel, images up to 10MB each</div>
                </div>
              </div>
              <div className="anonymous-toggle" onClick={() => setAnon(!anon)}>
                <div className={`toggle ${anon ? "on" : ""}`} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>Submit anonymously</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-3)", marginTop: "2px" }}>Your name won't be shown publicly, but is stored securely per our T&Cs</div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="alert alert-success" style={{ marginBottom: "1.25rem" }}>
                <Icon name="check" size={16} />
                <span>Ready to submit! Your QA Coordinator will be notified by email.</span>
              </div>
              <div style={{ background: "var(--cream)", border: "1px solid var(--border)", borderRadius: "8px", padding: "1.25rem" }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.05rem", fontWeight: 600, color: "var(--navy)", marginBottom: "0.75rem" }}>{title || "(No title)"}</div>
                <p style={{ fontSize: "0.875rem", color: "var(--text-2)", lineHeight: 1.7, marginBottom: "1rem" }}>{body || "(No description)"}</p>
                {selectedCats.length > 0 && <div className="idea-tags">{selectedCats.map(id => { const c = getCategoryById(categories, id); return c ? <span key={id} className="tag">{c.name}</span> : null; })}</div>}
                <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--text-3)" }}>Posting as: <strong>{anon ? "Anonymous" : "Dr. Sarah Mitchell"}</strong></div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {step > 1 && <button className="btn btn-outline" onClick={() => setStep(s => s - 1)}>Back</button>}
          <button className="btn btn-ghost" onClick={onClose} style={{ background: "var(--cream)", border: "1px solid var(--border)", color: "var(--text-2)" }}>Cancel</button>
          {step < 3
            ? <button className="btn btn-primary" disabled={step === 1 && !agreed || step === 2 && (!title || !body)} onClick={() => setStep(s => s + 1)}>Continue</button>
            : <button className="btn btn-gold" onClick={onClose}><Icon name="check" size={15} /> Submit Idea</button>
          }
        </div>
      </div>
    </div>
  );
}

function DashboardView({ ideas, currentUser }) {
  const topIdeas = [...ideas].sort((a, b) => b.votes - a.votes).slice(0, 3);
  const latestIdeas = [...ideas].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
  const mostViewed = [...ideas].sort((a, b) => b.views - a.views).slice(0, 3);

  const RankList = ({ title, items, scoreKey, icon }) => (
    <div className="card">
      <div className="card-header">
        <span className="card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Icon name={icon} size={16} />{title}</span>
      </div>
      <div style={{ padding: "0.75rem 1.25rem" }}>
        {items.map((idea, i) => (
          <div key={idea.id} style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem", padding: "0.75rem 0", borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none" }}>
            <div style={{ width: "24px", height: "24px", background: i === 0 ? "var(--gold)" : "var(--cream)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.75rem", color: i === 0 ? "var(--navy)" : "var(--text-3)", flexShrink: 0 }}>{i + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--navy)", marginBottom: "0.2rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{idea.title}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{idea.department} · {formatDate(idea.date)}</div>
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: "0.9rem", color: scoreKey === "votes" ? (idea.votes >= 0 ? "var(--green)" : "var(--red)") : "var(--navy)" }}>
              {scoreKey === "votes" ? (idea.votes > 0 ? "+" : "") + idea[scoreKey] : idea[scoreKey]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="hero-banner">
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: "0.5rem" }}>Academic Year 2025/26</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>Good afternoon, {currentUser.name.split(" ")[0]} 👋</h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>Here's an overview of the ideas portal activity this year.</p>
          <div className="closure-bar" style={{ marginTop: "1.25rem" }}>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {[
                { label: "Idea Submission Closes", date: "15 Nov 2025", status: "open" },
                { label: "Comment Period Closes", date: "15 Dec 2025", status: "open" },
              ].map((c, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0.625rem 1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", marginBottom: "2px" }}>{c.label}</div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.9rem", fontWeight: 600, color: "var(--gold-light)" }}>{c.date}</div>
                  </div>
                  <span className="badge-open">Open</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: "1.75rem" }}>
        {[
          { label: "Total Ideas", value: ideas.length, icon: "idea", cls: "si-gold" },
          { label: "Total Votes", value: 168, icon: "thumb_up", cls: "si-navy" },
          { label: "Total Views", value: 2584, icon: "eye", cls: "si-green" },
          { label: "Comments", value: 47, icon: "comment", cls: "si-red" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
              <div className="stat-label">{s.label}</div>
              <div className={`stat-icon ${s.cls}`}><Icon name={s.icon} size={16} /></div>
            </div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-3">
        <RankList title="Most Popular" items={topIdeas} scoreKey="votes" icon="star" />
        <RankList title="Most Viewed" items={mostViewed} scoreKey="views" icon="eye" />
        <RankList title="Latest Ideas" items={latestIdeas} scoreKey="comments" icon="idea" />
      </div>
    </div>
  );
}

function StatisticsView() {
  const maxDept = Math.max(...STATS.byDept.map(d => d.count));
  const maxCat = Math.max(...STATS.byCategory.map(d => d.count));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Statistical Analysis</h1>
        <p className="page-sub">Insights into idea submission patterns and engagement across the University.</p>
      </div>
      <div className="grid-4" style={{ marginBottom: "1.75rem" }}>
        {[
          { label: "Ideas Submitted", value: STATS.totalIdeas, icon: "idea", cls: "si-gold" },
          { label: "Total Comments", value: STATS.totalComments, icon: "comment", cls: "si-navy" },
          { label: "Votes Cast", value: STATS.totalVotes, icon: "thumb_up", cls: "si-green" },
          { label: "Total Views", value: STATS.totalViews, icon: "eye", cls: "si-red" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
              <div className="stat-label">{s.label}</div>
              <div className={`stat-icon ${s.cls}`}><Icon name={s.icon} size={16} /></div>
            </div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Ideas by Department</span></div>
          <div className="card-body">
            <div className="bar-chart">
              {STATS.byDept.map((d, i) => (
                <div key={i} className="bar-row">
                  <div className="bar-label">{d.dept}</div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${(d.count / maxDept) * 100}%` }} /></div>
                  <div className="bar-count">{d.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Ideas by Category</span></div>
          <div className="card-body">
            <div className="bar-chart">
              {STATS.byCategory.map((d, i) => (
                <div key={i} className="bar-row">
                  <div className="bar-label">{d.cat}</div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${(d.count / maxCat) * 100}%`, background: "linear-gradient(to right, var(--gold), var(--gold-light))" }} /></div>
                  <div className="bar-count">{d.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoriesView({ categories, setCategories }) {
  const [newCat, setNewCat] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const handleDelete = (id) => {
    const cat = categories.find(c => c.id === id);
    if (cat.used) { alert("Cannot delete: this category has been used."); return; }
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const handleAdd = () => {
    if (!newCat.trim()) return;
    setCategories(prev => [...prev, { id: Date.now(), name: newCat.trim(), used: false }]);
    setNewCat(""); setShowAdd(false);
  };

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">Manage Categories</h1>
          <p className="page-sub">Add new tags or remove unused ones. Categories in use cannot be deleted.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Icon name="plus" size={15} /> Add Category</button>
      </div>

      {showAdd && (
        <div className="alert alert-info" style={{ marginBottom: "1.25rem" }}>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: "0.5rem", fontWeight: 600 }}>New Category</div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <input className="form-input" placeholder="Category name…" value={newCat} onChange={e => setNewCat(e.target.value)} style={{ flex: 1 }} onKeyDown={e => e.key === "Enter" && handleAdd()} />
              <button className="btn btn-primary" onClick={handleAdd}>Add</button>
              <button className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span className="card-title">All Categories ({categories.length})</span>
          <span style={{ fontSize: "0.8rem", color: "var(--text-3)" }}>{categories.filter(c => !c.used).length} can be deleted</span>
        </div>
        <div style={{ padding: "0.5rem 1.5rem" }}>
          {categories.map(cat => (
            <div key={cat.id} className="category-row">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Icon name="tag" size={15} />
                <span style={{ fontWeight: 500, color: "var(--text)" }}>{cat.name}</span>
                {cat.used ? <span className="badge-open">In use</span> : <span className="badge-pending">Unused</span>}
              </div>
              <button
                className={`btn btn-sm ${cat.used ? "btn-outline" : "btn-danger"}`}
                onClick={() => handleDelete(cat.id)}
                disabled={cat.used}
                style={cat.used ? { opacity: 0.4, cursor: "not-allowed" } : {}}
                title={cat.used ? "Cannot delete: category is in use" : "Delete category"}
              >
                <Icon name="trash" size={13} /> {cat.used ? "In Use" : "Delete"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DownloadView() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Data Export</h1>
        <p className="page-sub">Download all data after the final closure date. Available to QA Manager only.</p>
      </div>
      <div className="alert alert-warning" style={{ marginBottom: "1.5rem" }}>
        <Icon name="alert" size={16} />
        <div>
          <strong>Final closure date not yet reached.</strong> The export will be available from 16 December 2025. Preview exports are available for testing.
        </div>
      </div>
      <div className="grid-2">
        {[
          {
            title: "Full Data Export (CSV)",
            desc: "All ideas, comments, votes, and user data for the current academic year. Suitable for import into Excel or a data analysis tool.",
            icon: "download",
            btn: "Download CSV",
            size: "~42KB",
            rows: ["All ideas with full text", "All comments", "Vote data (anonymised)", "User engagement metrics", "Category assignments"]
          },
          {
            title: "Uploaded Documents (ZIP)",
            desc: "All files uploaded by staff to support their ideas, packaged in a single ZIP archive.",
            icon: "zip",
            btn: "Download ZIP",
            size: "~8.4MB",
            rows: ["mentoring_proposal.pdf", "equipment_audit.xlsx", "cost_analysis.pdf", "ux_wireframes.pdf"]
          }
        ].map((item, i) => (
          <div key={i} className="card">
            <div className="card-header">
              <span className="card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Icon name={item.icon} size={16} /> {item.title}
              </span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.78rem", color: "var(--text-3)" }}>{item.size}</span>
            </div>
            <div className="card-body">
              <p style={{ fontSize: "0.875rem", color: "var(--text-2)", marginBottom: "1rem", lineHeight: 1.6 }}>{item.desc}</p>
              <div style={{ background: "var(--cream)", borderRadius: "6px", padding: "0.75rem", marginBottom: "1.25rem" }}>
                {item.rows.map((r, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.3rem 0", fontSize: "0.8rem", color: "var(--text-2)", borderBottom: j < item.rows.length - 1 ? "1px dashed var(--border)" : "none" }}>
                    <Icon name="check" size={12} /> {r}
                  </div>
                ))}
              </div>
              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                <Icon name="download" size={15} /> {item.btn}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminView() {
  const [activeTab, setActiveTab] = useState("dates");

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">System Administration</h1>
        <p className="page-sub">Manage system configuration, closure dates, and staff records.</p>
      </div>
      <div className="tabs">
        {[["dates", "bell", "Closure Dates"], ["users", "user", "Staff Records"], ["depts", "grid", "Departments"]].map(([key, icon, label]) => (
          <div key={key} className={`tab ${activeTab === key ? "active" : ""}`} onClick={() => setActiveTab(key)}>
            <Icon name={icon} size={14} /> {label}
          </div>
        ))}
      </div>

      {activeTab === "dates" && (
        <div className="card">
          <div className="card-header"><span className="card-title">Closure Dates — Academic Year 2025/26</span></div>
          <div className="card-body">
            <div className="grid-2" style={{ marginBottom: "1.5rem" }}>
              {[
                { label: "Ideas Submission Open", date: "01 Oct 2025", status: "open" },
                { label: "Ideas Closure Date", date: "15 Nov 2025", status: "open" },
                { label: "Comment Period Opens", date: "01 Oct 2025", status: "open" },
                { label: "Final Closure Date", date: "15 Dec 2025", status: "pending" },
              ].map((c, i) => (
                <div key={i} className="closure-item">
                  <div>
                    <div className="closure-label">{c.label}</div>
                    <div className="closure-date">{c.date}</div>
                  </div>
                  <span className={`badge-${c.status}`}>{c.status}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-primary btn-sm"><Icon name="settings" size={13} /> Edit Dates</button>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="card">
          <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="card-title">Staff Records</span>
            <button className="btn btn-primary btn-sm"><Icon name="plus" size={13} /> Add Staff</button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Department</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {USERS.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.name}</strong></td>
                  <td><span className={`badge-${u.role === "admin" ? "closed" : u.role === "qa_manager" ? "pending" : "open"}`} style={{ textTransform: "capitalize" }}>{u.role.replace("_", " ")}</span></td>
                  <td>{u.dept}</td>
                  <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.78rem" }}>{u.email}</td>
                  <td>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button className="btn-icon"><Icon name="settings" size={13} /></button>
                      <button className="btn-icon" style={{ color: "var(--red)", borderColor: "var(--red)" }}><Icon name="trash" size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "depts" && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Departments & QA Coordinators</span>
            <button className="btn btn-primary btn-sm"><Icon name="plus" size={13} /> Add Dept</button>
          </div>
          <table className="table">
            <thead><tr><th>Department</th><th>QA Coordinator</th><th>Ideas</th><th>Status</th></tr></thead>
            <tbody>
              {[
                ["Computer Science", "Dr. Alan Peters", 2, "active"],
                ["Engineering", "Prof. Lisa Huang", 1, "active"],
                ["Law", "Ms. Fiona Bell", 1, "active"],
                ["Architecture", "Mr. Carlos Rivera", 1, "active"],
                ["Human Resources", "Ms. Claire Thompson", 1, "active"],
                ["Mathematics", "Dr. Eve Nakamura", 0, "active"],
              ].map(([dept, coord, count, status], i) => (
                <tr key={i}>
                  <td><strong>{dept}</strong></td>
                  <td>{coord}</td>
                  <td><span className="badge-open">{count}</span></td>
                  <td><span className="badge-open">{status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(USERS[0]);
  const [page, setPage] = useState("dashboard");
  const [ideas] = useState(MOCK_IDEAS);
  const [categories, setCategories] = useState(MOCK_CATEGORIES);

  const roleColors = { staff: "av-staff", qa_coordinator: "av-coord", qa_manager: "av-manager", admin: "av-admin" };
  const roleLabels = { staff: "Staff", qa_coordinator: "QA Coordinator", qa_manager: "QA Manager", admin: "Administrator" };

  const navItems = [
    { id: "dashboard", icon: "home", label: "Dashboard", roles: ["staff", "qa_coordinator", "qa_manager", "admin"] },
    { id: "ideas", icon: "idea", label: "Browse Ideas", roles: ["staff", "qa_coordinator", "qa_manager", "admin"] },
    { id: "statistics", icon: "chart", label: "Statistics", roles: ["qa_coordinator", "qa_manager", "admin"] },
    { id: "categories", icon: "tag", label: "Categories", roles: ["qa_manager"] },
    { id: "download", icon: "download", label: "Export Data", roles: ["qa_manager"] },
    { id: "admin", icon: "settings", label: "Administration", roles: ["admin"] },
  ];

  if (!currentUser) {
    return (
      <>
        <style>{styles}</style>
        <div className="login-screen">
          <div className="login-card">
            <div className="login-header">
              <div className="login-logo">U</div>
              <div className="login-title">Ideas for Improvement</div>
              <div className="login-sub">University Quality Assurance Portal</div>
            </div>
            <div className="login-body">
              <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: "0.75rem" }}>Sign in as</div>
              <div className="user-selector">
                {USERS.map(u => (
                  <div key={u.id} className={`user-option ${selectedUser.id === u.id ? "selected" : ""}`} onClick={() => setSelectedUser(u)}>
                    <div className={`user-avatar ${roleColors[u.role]}`}>{u.name.split(" ").map(w => w[0]).join("").slice(0, 2)}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text)" }}>{u.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{roleLabels[u.role]} · {u.dept}</div>
                    </div>
                    {selectedUser.id === u.id && <div style={{ marginLeft: "auto" }}><Icon name="check" size={16} /></div>}
                  </div>
                ))}
              </div>
              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }} onClick={() => setCurrentUser(selectedUser)}>
                <Icon name="lock" size={15} /> Sign In
              </button>
              <div style={{ textAlign: "center", marginTop: "0.875rem", fontSize: "0.75rem", color: "var(--text-3)" }}>Protected by University SSO · v2.4.1</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const visibleNav = navItems.filter(n => n.roles.includes(currentUser.role));

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <nav className="nav">
          <div className="nav-brand">
            <div className="nav-logo">U</div>
            <div>
              <div className="nav-title">Ideas for Improvement</div>
              <div className="nav-subtitle">Quality Assurance Portal</div>
            </div>
          </div>
          <div className="nav-actions">
            <div className="nav-user">
              <span>{currentUser.name}</span>
              <span className="role-badge">{roleLabels[currentUser.role]}</span>
            </div>
            <button className="btn-ghost" onClick={() => setCurrentUser(null)}>
              <Icon name="logout" size={14} /> Sign Out
            </button>
          </div>
        </nav>

        <div className="layout">
          <aside className="sidebar">
            <div className="sidebar-section">Navigation</div>
            {visibleNav.map(item => (
              <div key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => setPage(item.id)}>
                <Icon name={item.icon} size={16} /> {item.label}
              </div>
            ))}
            <div style={{ marginTop: "auto", padding: "0.75rem 1.25rem", borderTop: "1px solid var(--border)", marginTop: "1.5rem" }}>
              <div style={{ display: "flex", align: "center", gap: "0.5rem" }}>
                <div className={`user-avatar ${roleColors[currentUser.role]}`} style={{ width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.75rem", color: "white", flexShrink: 0 }}>
                  {currentUser.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.8rem", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentUser.name}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>{currentUser.dept}</div>
                </div>
              </div>
            </div>
          </aside>

          <main className="main">
            {page === "dashboard" && <DashboardView ideas={ideas} currentUser={currentUser} />}
            {page === "ideas" && <IdeasView ideas={ideas} categories={categories} currentUser={currentUser} />}
            {page === "statistics" && <StatisticsView />}
            {page === "categories" && <CategoriesView categories={categories} setCategories={setCategories} />}
            {page === "download" && <DownloadView />}
            {page === "admin" && <AdminView />}
          </main>
        </div>
      </div>
    </>
  );
}
