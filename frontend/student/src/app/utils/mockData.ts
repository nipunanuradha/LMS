export interface User {
  id: string;
  name: string;
  phone: string;
  district: string;
  province: string;
  password: string;
}

export interface Course {
  id: string;
  title: string;
  expiryDate: string;
  enrolled: boolean;
}

export interface Recording {
  id: string;
  title: string;
  videoUrl: string;
  duration: string;
  watched: boolean;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
}

export interface PDFNote {
  id: string;
  title: string;
  downloadUrl: string;
  size: string;
}

export interface ExternalLink {
  id: string;
  title: string;
  url: string;
  description: string;
}

// Mock users for demo
export const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    phone: "0771234567",
    district: "Colombo",
    province: "Western",
    password: "demo123",
  },
];

// Mock courses
export const mockCourses: Course[] = [
  {
    id: "1",
    title: "Advanced Mathematics",
    expiryDate: "2026-08-15",
    enrolled: true,
  },
  {
    id: "2",
    title: "Physics - Mechanics",
    expiryDate: "2026-07-20",
    enrolled: true,
  },
  {
    id: "3",
    title: "Chemistry - Organic",
    expiryDate: "2026-09-10",
    enrolled: true,
  },
  {
    id: "4",
    title: "English Language",
    expiryDate: "2026-06-30",
    enrolled: true,
  },
];

// Mock course content
export const mockRecordings: Record<string, Recording[]> = {
  "1": [
    {
      id: "r1",
      title: "Calculus Fundamentals - Introduction",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      duration: "45:30",
      watched: false,
    },
    {
      id: "r2",
      title: "Differentiation Techniques",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      duration: "52:15",
      watched: true,
    },
    {
      id: "r3",
      title: "Integration Methods",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      duration: "48:20",
      watched: false,
    },
  ],
  "2": [
    {
      id: "r4",
      title: "Newton's Laws of Motion",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      duration: "40:00",
      watched: false,
    },
  ],
};

export const mockNotices: Record<string, Notice[]> = {
  "1": [
    {
      id: "n1",
      title: "Welcome to Advanced Mathematics",
      content: "Welcome to the course! Please make sure to watch all video lessons and complete the assignments on time.",
      date: "2026-05-01",
    },
    {
      id: "n2",
      title: "Mid-term Exam Schedule",
      content: "The mid-term examination will be held on June 15, 2026. Please prepare accordingly.",
      date: "2026-05-10",
    },
  ],
  "2": [
    {
      id: "n3",
      title: "Course Updates",
      content: "New lecture materials have been added to the recordings section.",
      date: "2026-05-12",
    },
  ],
};

export const mockPDFs: Record<string, PDFNote[]> = {
  "1": [
    {
      id: "p1",
      title: "Calculus Formula Sheet",
      downloadUrl: "#",
      size: "2.5 MB",
    },
    {
      id: "p2",
      title: "Practice Problems - Set 1",
      downloadUrl: "#",
      size: "1.8 MB",
    },
    {
      id: "p3",
      title: "Chapter 3 - Comprehensive Notes",
      downloadUrl: "#",
      size: "4.2 MB",
    },
  ],
  "2": [
    {
      id: "p4",
      title: "Mechanics Quick Reference",
      downloadUrl: "#",
      size: "1.5 MB",
    },
  ],
};

export const mockExternalLinks: Record<string, ExternalLink[]> = {
  "1": [
    {
      id: "l1",
      title: "Khan Academy - Calculus",
      url: "https://www.khanacademy.org/math/calculus-1",
      description: "Comprehensive calculus tutorials and practice exercises",
    },
    {
      id: "l2",
      title: "Wolfram MathWorld",
      url: "https://mathworld.wolfram.com/",
      description: "Mathematical reference encyclopedia",
    },
  ],
  "2": [
    {
      id: "l3",
      title: "Physics Classroom",
      url: "https://www.physicsclassroom.com/",
      description: "Interactive physics tutorials and simulations",
    },
  ],
};

// Helper to calculate days remaining
export function getDaysRemaining(expiryDate: string): number {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
