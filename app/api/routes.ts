import { NextResponse } from "next/server";

// ============================================
// MOCK DATABASES (Simulating your 3 databases)
// ============================================

// 1. MOCK PATIENTS DATA (Users with PATIENT role)
const mockPatients = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    fullName: "Sarah Mitchell",
    email: "sarah@example.com",
    phoneNumber: "+1 (555) 101-2001",
    dateOfBirth: "1990-03-15",
    gender: "Female",
    emergencyContactName: "Tom Mitchell",
    emergencyContactPhone: "+1 (555) 201-3001",
    medicalHistory: "Mild hypertension. Allergic to penicillin. Previous root canal on lower left molar (2022).",
    referenceCode: "REF-SM-001",
    referencePoints: 120,
    role: "PATIENT",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    fullName: "Robert Klein",
    email: "robert@example.com",
    phoneNumber: "+1 (555) 102-2002",
    dateOfBirth: "1978-07-22",
    gender: "Male",
    emergencyContactName: "Anna Klein",
    emergencyContactPhone: "+1 (555) 202-3002",
    medicalHistory: "Type 2 diabetes (controlled). No known drug allergies. Regular dental cleanings every 6 months.",
    referenceCode: "REF-RK-002",
    referencePoints: 85,
    role: "PATIENT",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    fullName: "Linda Wu",
    email: "linda@example.com",
    phoneNumber: "+1 (555) 103-2003",
    dateOfBirth: "1995-11-08",
    gender: "Female",
    emergencyContactName: "Kevin Wu",
    emergencyContactPhone: "+1 (555) 203-3003",
    medicalHistory: "No significant medical history. Currently undergoing Invisalign treatment (Month 6 of 24).",
    referenceCode: "REF-LW-003",
    referencePoints: 200,
    role: "PATIENT",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    fullName: "James Hardy",
    email: "james@example.com",
    phoneNumber: "+1 (555) 104-2004",
    dateOfBirth: "1971-05-30",
    gender: "Male",
    emergencyContactName: "Patricia Hardy",
    emergencyContactPhone: "+1 (555) 204-3004",
    medicalHistory: "Asthma (mild, inhaler as needed). Allergic to latex. Chipped front tooth repaired May 2024.",
    referenceCode: "REF-JH-004",
    referencePoints: 50,
    role: "PATIENT",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    fullName: "Maria Garcia",
    email: "maria@example.com",
    phoneNumber: "+1 (555) 105-2005",
    dateOfBirth: "1988-09-14",
    gender: "Female",
    emergencyContactName: "Carlos Garcia",
    emergencyContactPhone: "+1 (555) 205-3005",
    medicalHistory: "No known allergies. Anxiety disorder (managed). Prefers sedation dentistry.",
    referenceCode: "REF-MG-005",
    referencePoints: 30,
    role: "PATIENT",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    fullName: "David Kim",
    email: "david@example.com",
    phoneNumber: "+1 (555) 106-2006",
    dateOfBirth: "1983-02-19",
    gender: "Male",
    emergencyContactName: "Jenny Kim",
    emergencyContactPhone: "+1 (555) 206-3006",
    medicalHistory: "High cholesterol (medicated). No dental allergies. Crown fitting in progress for upper right molar.",
    referenceCode: "REF-DK-006",
    referencePoints: 75,
    role: "PATIENT",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440007",
    fullName: "Emma Thompson",
    email: "emma@example.com",
    phoneNumber: "+1 (555) 107-2007",
    dateOfBirth: "2001-06-25",
    gender: "Female",
    emergencyContactName: "Rachel Thompson",
    emergencyContactPhone: "+1 (555) 207-3007",
    medicalHistory: "No significant medical history. First dental visit at this clinic. Wisdom teeth monitoring.",
    referenceCode: "REF-ET-007",
    referencePoints: 10,
    role: "PATIENT",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440008",
    fullName: "Michael Jordan",
    email: "michael@example.com",
    phoneNumber: "+1 (555) 108-2008",
    dateOfBirth: "1969-12-03",
    gender: "Male",
    emergencyContactName: "Diane Jordan",
    emergencyContactPhone: "+1 (555) 208-3008",
    medicalHistory: "Hypertension (medicated). Previous periodontal treatment (2021). Requires antibiotic prophylaxis before procedures.",
    referenceCode: "REF-MJ-008",
    referencePoints: 160,
    role: "PATIENT",
  },
];

// 2. MOCK DOCTORS DATA
const mockDoctors = [
  { id: "660e8400-e29b-41d4-a716-446655440001", fullName: "Emily Chen", lastName: "Chen", role: "DOCTOR" },
  { id: "660e8400-e29b-41d4-a716-446655440002", fullName: "James Wilson", lastName: "Wilson", role: "DOCTOR" },
  { id: "660e8400-e29b-41d4-a716-446655440003", fullName: "Michael Brown", lastName: "Brown", role: "DOCTOR" },
  { id: "660e8400-e29b-41d4-a716-446655440004", fullName: "Sarah Lee", lastName: "Lee", role: "DOCTOR" },
];

// 3. MOCK APPOINTMENTS DATA (from Appointment DB)
// Statuses: BOOKED | ARRIVAL | ASSIGN | COMPLETE | CANCEL | MISSED
const mockAppointments = [
  {
    id: "770e8400-e29b-41d4-a716-446655440001",
    patientId: "550e8400-e29b-41d4-a716-446655440001",
    patientName: "Sarah Mitchell",
    doctorId: "660e8400-e29b-41d4-a716-446655440001",
    doctorName: "Dr. Emily Chen",
    appointmentDate: "2024-05-20T09:30:00",
    status: "BOOKED",
    createdAt: "2024-05-15T10:00:00"
  },
  {
    id: "770e8400-e29b-41d4-a716-446655440002",
    patientId: "550e8400-e29b-41d4-a716-446655440002",
    patientName: "Robert Klein",
    doctorId: "660e8400-e29b-41d4-a716-446655440002",
    doctorName: "Dr. James Wilson",
    appointmentDate: "2024-05-20T11:00:00",
    status: "ARRIVAL",
    createdAt: "2024-05-16T14:30:00"
  },
  {
    id: "770e8400-e29b-41d4-a716-446655440003",
    patientId: "550e8400-e29b-41d4-a716-446655440003",
    patientName: "Linda Wu",
    doctorId: "660e8400-e29b-41d4-a716-446655440001",
    doctorName: "Dr. Emily Chen",
    appointmentDate: "2024-05-21T13:30:00",
    status: "ASSIGN",
    createdAt: "2024-05-17T09:15:00"
  },
  {
    id: "770e8400-e29b-41d4-a716-446655440004",
    patientId: "550e8400-e29b-41d4-a716-446655440004",
    patientName: "James Hardy",
    doctorId: "660e8400-e29b-41d4-a716-446655440003",
    doctorName: "Dr. Michael Brown",
    appointmentDate: "2024-05-21T15:00:00",
    status: "COMPLETE",
    createdAt: "2024-05-18T11:45:00"
  },
  {
    id: "770e8400-e29b-41d4-a716-446655440005",
    patientId: "550e8400-e29b-41d4-a716-446655440005",
    patientName: "Maria Garcia",
    doctorId: "660e8400-e29b-41d4-a716-446655440004",
    doctorName: "Dr. Sarah Lee",
    appointmentDate: "2024-05-22T10:00:00",
    status: "CANCEL",
    createdAt: "2024-05-19T08:30:00"
  },
  {
    id: "770e8400-e29b-41d4-a716-446655440006",
    patientId: "550e8400-e29b-41d4-a716-446655440006",
    patientName: "David Kim",
    doctorId: "660e8400-e29b-41d4-a716-446655440002",
    doctorName: "Dr. James Wilson",
    appointmentDate: "2024-05-22T14:00:00",
    status: "MISSED",
    createdAt: "2024-05-20T13:20:00"
  },
  {
    id: "770e8400-e29b-41d4-a716-446655440007",
    patientId: "550e8400-e29b-41d4-a716-446655440007",
    patientName: "Emma Thompson",
    doctorId: "660e8400-e29b-41d4-a716-446655440001",
    doctorName: "Dr. Emily Chen",
    appointmentDate: "2024-05-23T10:30:00",
    status: "BOOKED",
    createdAt: "2024-05-21T15:45:00"
  },
  {
    id: "770e8400-e29b-41d4-a716-446655440008",
    patientId: "550e8400-e29b-41d4-a716-446655440008",
    patientName: "Michael Jordan",
    doctorId: "660e8400-e29b-41d4-a716-446655440003",
    doctorName: "Dr. Michael Brown",
    appointmentDate: "2024-05-23T13:00:00",
    status: "ARRIVAL",
    createdAt: "2024-05-22T09:00:00"
  }
];

// 4. MOCK PATIENT HISTORIES DATA (from PatientHistory DB)
const mockPatientHistories = [
  {
    id: "880e8400-e29b-41d4-a716-446655440001",
    patientId: "550e8400-e29b-41d4-a716-446655440001",
    patientName: "Sarah Mitchell",
    doctorId: "660e8400-e29b-41d4-a716-446655440001",
    doctorName: "Dr. Emily Chen",
    appointmentId: "770e8400-e29b-41d4-a716-446655440001",
    appointmentDate: "2024-05-20T09:30:00",
    amount: 850.00,
    balance: 0.00,
    paymentStatus: "PAID",
    status: "COMPLETED",
    observation: "Root canal therapy completed on left molar. Patient responded well to treatment.",
    createdAt: "2024-05-20T10:30:00"
  },
  {
    id: "880e8400-e29b-41d4-a716-446655440002",
    patientId: "550e8400-e29b-41d4-a716-446655440002",
    patientName: "Robert Klein",
    doctorId: "660e8400-e29b-41d4-a716-446655440002",
    doctorName: "Dr. James Wilson",
    appointmentId: "770e8400-e29b-41d4-a716-446655440002",
    appointmentDate: "2024-05-20T11:00:00",
    amount: 150.00,
    balance: 0.00,
    paymentStatus: "PAID",
    status: "COMPLETED",
    observation: "Regular dental cleaning and checkup. No cavities detected.",
    createdAt: "2024-05-20T12:00:00"
  },
  {
    id: "880e8400-e29b-41d4-a716-446655440003",
    patientId: "550e8400-e29b-41d4-a716-446655440003",
    patientName: "Linda Wu",
    doctorId: "660e8400-e29b-41d4-a716-446655440001",
    doctorName: "Dr. Emily Chen",
    appointmentId: "770e8400-e29b-41d4-a716-446655440003",
    appointmentDate: "2024-05-21T13:30:00",
    amount: 3200.00,
    balance: 200.00,
    paymentStatus: "PENDING",
    status: "IN_PROGRESS",
    observation: "Invisalign alignment check - Month 6 of treatment. Progress is excellent.",
    createdAt: "2024-05-21T14:30:00"
  },
  {
    id: "880e8400-e29b-41d4-a716-446655440004",
    patientId: "550e8400-e29b-41d4-a716-446655440004",
    patientName: "James Hardy",
    doctorId: "660e8400-e29b-41d4-a716-446655440003",
    doctorName: "Dr. Michael Brown",
    appointmentId: "770e8400-e29b-41d4-a716-446655440004",
    appointmentDate: "2024-05-21T15:00:00",
    amount: 450.00,
    balance: 0.00,
    paymentStatus: "PAID",
    status: "COMPLETED",
    observation: "Emergency tooth repair - chipped front tooth successfully restored.",
    createdAt: "2024-05-21T16:00:00"
  },
  {
    id: "880e8400-e29b-41d4-a716-446655440005",
    patientId: "550e8400-e29b-41d4-a716-446655440006",
    patientName: "David Kim",
    doctorId: "660e8400-e29b-41d4-a716-446655440002",
    doctorName: "Dr. James Wilson",
    appointmentId: "770e8400-e29b-41d4-a716-446655440006",
    appointmentDate: "2024-05-22T14:00:00",
    amount: 1200.00,
    balance: 1200.00,
    paymentStatus: "UNPAID",
    status: "PENDING",
    observation: "Crown fitting scheduled for upper right molar. Temporary crown placed.",
    createdAt: "2024-05-22T15:00:00"
  }
];

// 5. MOCK REVIEWS DATA (from AppointmentReview DB)
const mockReviews = [
  {
    id: "990e8400-e29b-41d4-a716-446655440001",
    appointmentId: "770e8400-e29b-41d4-a716-446655440001",
    patientId: "550e8400-e29b-41d4-a716-446655440001",
    patientName: "Sarah Mitchell",
    doctorName: "Dr. Emily Chen",
    rating: 5,
    comment: "Excellent service! Dr. Chen was very professional and caring throughout my root canal procedure.",
    createdAt: "2024-05-21T10:00:00"
  },
  {
    id: "990e8400-e29b-41d4-a716-446655440002",
    appointmentId: "770e8400-e29b-41d4-a716-446655440002",
    patientId: "550e8400-e29b-41d4-a716-446655440002",
    patientName: "Robert Klein",
    doctorName: "Dr. James Wilson",
    rating: 5,
    comment: "Very thorough cleaning. My teeth feel amazing!",
    createdAt: "2024-05-21T14:00:00"
  },
  {
    id: "990e8400-e29b-41d4-a716-446655440003",
    appointmentId: "770e8400-e29b-41d4-a716-446655440004",
    patientId: "550e8400-e29b-41d4-a716-446655440004",
    patientName: "James Hardy",
    doctorName: "Dr. Michael Brown",
    rating: 4,
    comment: "Great emergency service, fixed my tooth quickly.",
    createdAt: "2024-05-22T09:00:00"
  }
];

// ============================================
// DASHBOARD DATA AGGREGATION FUNCTIONS
// ============================================

// 1. Get Total Patients (count from patient DB)
function getTotalPatients() {
  return mockPatients.length;
}

// 2. Get Daily Appointments (count appointments for today)
function getDailyAppointments() {
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = mockAppointments.filter(app => 
    app.appointmentDate.startsWith(today)
  );
  return todayAppointments.length;
}

// 3. Get Monthly Revenue (sum of amounts from patient histories where paymentStatus is PAID)
function getMonthlyRevenue() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  const paidHistories = mockPatientHistories.filter(history => {
    const historyDate = new Date(history.appointmentDate);
    return history.paymentStatus === "PAID" &&
           historyDate.getFullYear() === currentYear &&
           historyDate.getMonth() === currentMonth;
  });
  
  const total = paidHistories.reduce((sum, history) => sum + history.amount, 0);
  return total;
}

// 4. Get Patient Satisfaction (average rating from reviews DB)
function getPatientSatisfaction() {
  if (mockReviews.length === 0) return 0;
  
  const totalRating = mockReviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / mockReviews.length;
  const percentage = (averageRating / 5) * 100;
  return Math.round(percentage);
}

// 5. Get Recent Appointments (last 5 appointments by createdAt)
function getRecentAppointments() {
  // Sort by createdAt date (newest first)
  const sortedAppointments = [...mockAppointments].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Take last 5
  const last5 = sortedAppointments.slice(0, 5);
  
  // Format to match frontend expected structure
  return last5.map(app => {
    // Map appointment status to frontend status values
    let status = "book";
    switch (app.status) {
      case "BOOKED":   status = "book";     break;
      case "ARRIVAL":  status = "arrive";   break;
      case "ASSIGN":   status = "assign";   break;
      case "COMPLETE": status = "complete"; break;
      case "CANCEL":   status = "cancel";   break;
      case "MISSED":   status = "missed";   break;
      default:         status = "book";
    }
    
    // Get initials from patient name
    const initials = app.patientName.split(' ').map(n => n[0]).join('').toUpperCase();
    
    // Get note from patient history if available
    const history = mockPatientHistories.find(h => h.appointmentId === app.id);
    const note = history?.observation || getDefaultNote(app.status);
    
    // Format date and time
    const dateObj = new Date(app.appointmentDate);
    const formattedDate = dateObj.toISOString().split('T')[0];
    const formattedTime = dateObj.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    return {
      patient: app.patientName,
      id: formatId(app.id),
      initials: initials,
      doctor: app.doctorName,
      note: note,
      date: formattedDate,
      time: formattedTime,
      status: status
    };
  });
}

// Helper function to format ID
function formatId(uuid: string) {
  const last4 = uuid.slice(-4);
  return `#${last4.toUpperCase()}`;
}

// Helper function to get default note based on status
function getDefaultNote(status: string) {
  switch (status) {
    case "BOOKED":   return "Appointment scheduled, awaiting patient arrival";
    case "ARRIVAL":  return "Patient has arrived and is checked in";
    case "ASSIGN":   return "Doctor assigned, treatment in progress";
    case "COMPLETE": return "Treatment completed successfully";
    case "CANCEL":   return "Appointment was cancelled";
    case "MISSED":   return "Patient did not attend the appointment";
    default:         return "No additional notes available";
  }
}

// Helper function to format currency
function formatCurrency(amount: number) {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return `$${amount}`;
}

// Get badge color based on value
function getRevenueBadge(revenue: number) {
  const revenueK = revenue / 1000;
  if (revenueK > 40) return { badge: "+12%", color: "bg-[#F0FDFA] text-[#0D9488]" };
  if (revenueK > 30) return { badge: "+5%", color: "bg-[#F0FDFA] text-[#0D9488]" };
  return { badge: "-3%", color: "bg-[#FFDAD6] text-[#BA1A1A]" };
}

function getSatisfactionBadge(satisfaction: number) {
  if (satisfaction >= 95) return { badge: "Excellent", color: "bg-[#F0FDFA] text-[#0D9488]" };
  if (satisfaction >= 85) return { badge: "High", color: "bg-[#F0FDFA] text-[#0D9488]" };
  if (satisfaction >= 70) return { badge: "Good", color: "bg-[#FEF3C7] text-[#92400E]" };
  return { badge: "Needs Work", color: "bg-[#FFDAD6] text-[#BA1A1A]" };
}

// ============================================
// RESOURCE HANDLER FUNCTIONS
// ============================================

export async function getPatientHistories() {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockPatientHistories.map(h => ({
    id: h.id,
    shortId: `PH-${h.id.slice(-3)}`,
    patientId: h.patientId,
    patientName: h.patientName,
    initials: h.patientName.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
    doctorId: h.doctorId,
    doctorName: h.doctorName,
    appointmentId: h.appointmentId,
    date: new Date(h.appointmentDate).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    }),
    time: new Date(h.appointmentDate).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit',
    }),
    amount: `$${h.amount.toLocaleString()}`,
    paymentStatus: h.paymentStatus,
    status: h.status,
    observation: h.observation,
    createdAt: new Date(h.createdAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    }),
  }));
}

export async function getAppointments() {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockAppointments.map(app => {
    const dateObj = new Date(app.appointmentDate);
    return {
      id: formatId(app.id),
      rawId: app.id,
      patientId: app.patientId,
      patientName: app.patientName,
      initials: app.patientName.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
      doctorId: app.doctorId,
      doctorName: app.doctorName,
      date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: app.status,
      observation: mockPatientHistories.find(h => h.appointmentId === app.id)?.observation || getDefaultNote(app.status),
    };
  });
}

export async function getPatients() {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockPatients.map(p => {
    const patientAppointments = mockAppointments
      .filter(a => a.patientId === p.id)
      .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
    const latest = patientAppointments[0];
    return {
      id: p.id,
      shortId: `P-${p.id.slice(-3)}`,
      fullName: p.fullName,
      initials: p.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
      email: p.email,
      phoneNumber: p.phoneNumber,
      dateOfBirth: p.dateOfBirth,
      gender: p.gender,
      emergencyContactName: p.emergencyContactName,
      emergencyContactPhone: p.emergencyContactPhone,
      medicalHistory: p.medicalHistory,
      referenceCode: p.referenceCode,
      referencePoints: p.referencePoints,
      lastVisit: latest
        ? new Date(latest.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'No visits',
      status: latest?.status === 'CANCEL' ? 'Inactive' : 'Active',
    };
  });
}

export async function getDoctors() {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockDoctors.map(d => {
    const patientCount = new Set(
      mockAppointments.filter(a => a.doctorId === d.id).map(a => a.patientId)
    ).size;
    return {
      id: d.id,
      shortId: `D-${d.id.slice(-3)}`,
      fullName: `Dr. ${d.fullName}`,
      initials: d.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
      specialty: 'General Dentist',
      email: `${d.fullName.split(' ')[0].toLowerCase()}.${d.lastName.toLowerCase()}@dentline.com`,
      patients: patientCount,
      status: 'Active',
    };
  });
}

export async function getReviews() {
  await new Promise(resolve => setTimeout(resolve, 300));
  const totalRating = mockReviews.reduce((s, r) => s + r.rating, 0);
  const avgRating = mockReviews.length ? (totalRating / mockReviews.length) : 0;
  const recommendRate = mockReviews.length
    ? Math.round((mockReviews.filter(r => r.rating >= 4).length / mockReviews.length) * 100)
    : 0;
  return {
    summary: {
      averageRating: parseFloat(avgRating.toFixed(1)),
      totalReviews: mockReviews.length,
      recommendRate,
    },
    reviews: mockReviews.map(r => ({
      id: r.id,
      patientName: r.patientName,
      initials: r.patientName.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
      doctorName: r.doctorName,
      rating: r.rating,
      comment: r.comment,
      date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    })),
  };
}

export async function getPayments() {
  await new Promise(resolve => setTimeout(resolve, 300));
  const totalRevenue = mockPatientHistories.reduce((s, h) => s + (h.paymentStatus === 'PAID' ? h.amount : 0), 0);
  const pendingAmount = mockPatientHistories.reduce((s, h) => s + (h.paymentStatus !== 'PAID' ? h.amount : 0), 0);
  const pendingCount = mockPatientHistories.filter(h => h.paymentStatus !== 'PAID').length;

  const statusMap: Record<string, string> = { PAID: 'Paid', PENDING: 'Pending', UNPAID: 'Unpaid' };

  return {
    summary: {
      totalRevenue: `$${totalRevenue.toLocaleString()}`,
      pendingAmount: `$${pendingAmount.toLocaleString()}`,
      pendingCount,
    },
    payments: mockPatientHistories.map((h, idx) => ({
      id: `PAY-${String(idx + 1).padStart(3, '0')}`,
      patientName: h.patientName,
      procedure: h.observation.split('.')[0],
      amount: `$${h.amount.toLocaleString()}`,
      balance: `$${h.balance.toLocaleString()}`,  // Added balance field
      date: new Date(h.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      paymentStatus: statusMap[h.paymentStatus] ?? h.paymentStatus,
    })),
  };
}

// ============================================
// DASHBOARD API ROUTE HANDLER
// ============================================

export async function GET(request: Request) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    // Get auth token from headers
    const authHeader = request.headers.get('Authorization');
    
    // For demo purposes, we'll still return data even without token
    // In production, you would validate the token here
    
    // Calculate all dashboard metrics
    const totalPatients = getTotalPatients();
    const dailyAppointments = getDailyAppointments();
    const monthlyRevenueAmount = getMonthlyRevenue();
    const satisfactionRate = getPatientSatisfaction();
    
    const revenueData = getRevenueBadge(monthlyRevenueAmount);
    const satisfactionData = getSatisfactionBadge(satisfactionRate);
    
    // Build stats array
    const stats = [
      {
        label: "Total Patients",
        value: totalPatients.toLocaleString(),
        badge: "+12%",
        badgeColor: "bg-[#F0FDFA] text-[#0D9488]"
      },
      {
        label: "Daily Appointments",
        value: dailyAppointments.toString(),
        badge: dailyAppointments > 0 ? "Today" : "None",
        badgeColor: dailyAppointments > 0 ? "bg-[#F0FDFA] text-[#0D9488]" : "bg-[#F1F5F9] text-[#64748B]"
      },
      {
        label: "Monthly Revenue",
        value: formatCurrency(monthlyRevenueAmount),
        badge: revenueData.badge,
        badgeColor: revenueData.color
      },
      {
        label: "Patient Satisfaction",
        value: `${satisfactionRate}%`,
        badge: satisfactionData.badge,
        badgeColor: satisfactionData.color
      }
    ];
    
    // Get recent appointments
    const appointments = getRecentAppointments();
    
    // Return response
    return NextResponse.json({
      success: true,
      message: "Dashboard data retrieved successfully",
      data: {
        stats,
        appointments
      }
    });
    
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch dashboard data",
        error: String(error)
      },
      { status: 500 }
    );
  }
}