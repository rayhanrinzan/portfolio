// Facts copied from content/profile.md. Anything missing there stays a
// visible TODO(rinzan) string; never fill these in by guessing.
export const profile = {
  name: 'Rayhan Rinzan',
  location: 'Ithaca, New York',
  lookingFor: 'TODO(rinzan): what you are recruiting for (season, role types)',
  intro: 'TODO(rinzan): intro paragraph',
  education: {
    school: 'Cornell University',
    degree: 'BS Computer Science',
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
    activities: ['Autonomous Boat Project Team (Software)', 'AI Alignment'],
  },
  contact: {
    email: 'rmr326@cornell.edu',
    linkedin: 'https://www.linkedin.com/in/rinzan',
    github: 'TODO(rinzan): GitHub URL',
    resume: 'TODO(rinzan): résumé PDF at public/resume.pdf',
  },
} as const;
