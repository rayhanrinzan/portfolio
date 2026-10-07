// Facts copied from content/profile.md. Anything missing there stays a
// visible TODO(rinzan) string; never fill these in by guessing.
export const profile = {
  name: 'Rayhan Rinzan',
  location: 'Ithaca, NY',
  lookingFor: 'Exploring opportunities in software engineering, machine learning, and data science.',
  intro:
    "I'm Rayhan, a computer science student at Cornell University interested in intelligent systems, with a focus on machine learning, autonomy, and data engineering. My experience spans software engineering, robotics, and applied machine learning.",
  education: {
    school: 'Cornell University',
    degree: 'BS in Computer Science',
    start: '2025',
    end: '2029',
    coursework: [
      'Data Structures and OOP',
      'Functional Programming',
      'Discrete Math',
      'Data Science and Decision Making',
      'Linear Algebra',
      'Differential Equations',
      'Circuits',
    ],
    activities: [
      'Autonomous Boat Project Team (Software)',
      'Institute of Electrical and Electronics Engineers (PR Team)',
      'South Asian Council (Publicity Team)',
      'Society of Asian Scientists and Engineers',
      'AI Alignment',
      'Muslim Educational & Cultural Association',
      'Notion Campus Leader',
      'Adobe Campus Ambassador',
    ],
  },
  // newest first
  awards: [
    {
      event: 'MIT BeaverWorks 2025',
      place: '1st place',
      division: 'UAS-SAR Signal Processing (International Division)',
      issuer: 'Massachusetts Institute of Technology',
      date: '2025-07',
    },
    {
      event: 'Lockheed Martin CodeQuest',
      place: '2nd place',
      division: 'Advanced Division',
      issuer: 'Lockheed Martin',
      date: '2025-03',
    },
  ],
  contact: {
    email: 'rmr326@cornell.edu',
    linkedin: 'https://www.linkedin.com/in/rinzan',
    github: 'https://github.com/rayhanrinzan',
    // No résumé yet. Put the PDF at public/resume.pdf and set this to
    // '/resume.pdf'; the contact links leave it out while it is empty.
    resume: '',
  },
} as const;
