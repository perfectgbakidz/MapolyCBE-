import { Exam, Question, User, SecurityLogEvent, ExamResult } from '../types';

export const SEED_ADMIN: User = {
  id: 'admin_root_001',
  name: 'Prof. Evelyn Vance',
  email: 'admin@mapoly.edu.ng',
  role: 'admin',
  department: 'Academic Examination Board & Security Office',
  registeredAt: '2026-01-10T08:00:00.000Z',
  lastLoginAt: new Date().toISOString(),
};

export const SEED_CANDIDATES: User[] = [
  {
    id: 'cand_001',
    name: 'Kosisochukwu Nwafor',
    email: 'kosi.nwafor@mapoly.edu.ng',
    role: 'candidate',
    regNumber: 'MAPOLY/2026/CS/0492',
    phone: '+234 803 382 9014',
    department: 'Department of Computer Science & Engineering',
    registeredAt: '2026-02-01T10:30:00.000Z',
    lastLoginAt: new Date().toISOString(),
  },
  {
    id: 'cand_002',
    name: 'Sarah Jenkins',
    email: 'sarah.j@mapoly.edu.ng',
    role: 'candidate',
    regNumber: 'MAPOLY/2026/CS/0511',
    phone: '+234 802 749 1120',
    department: 'Department of Computer Science & Engineering',
    registeredAt: '2026-02-05T14:15:00.000Z',
    lastLoginAt: '2026-08-20T11:00:00.000Z',
  },
  {
    id: 'cand_003',
    name: 'David Chen',
    email: 'david.chen@mapoly.edu.ng',
    role: 'candidate',
    regNumber: 'MAPOLY/2026/SE/0199',
    phone: '+234 814 602 8833',
    department: 'Department of Software Engineering',
    registeredAt: '2026-02-11T09:00:00.000Z',
    lastLoginAt: '2026-08-22T16:45:00.000Z',
  }
];

export const SEED_QUESTIONS_CSC401: Question[] = [
  {
    id: 'q_csc_01',
    examId: 'exam_csc_401',
    questionNumber: 1,
    text: 'In modern multi-core operating systems, what is the primary purpose of the Translation Lookaside Buffer (TLB)?',
    options: [
      { id: 'A', text: 'To act as a high-speed hardware cache for virtual-to-physical address page table translations.' },
      { id: 'B', text: 'To store CPU instruction microcodes for out-of-order execution pipelines.' },
      { id: 'C', text: 'To buffer asynchronous interrupt requests from network interface controllers.' },
      { id: 'D', text: 'To encrypt kernel stack frames prior to context switches.' },
    ],
    correctOptionId: 'A',
    points: 2,
    explanation: 'The TLB is a memory management hardware cache that stores recent translations of virtual memory to physical addresses, reducing the overhead of multi-level page table walks.',
    category: 'Virtual Memory'
  },
  {
    id: 'q_csc_02',
    examId: 'exam_csc_401',
    questionNumber: 2,
    text: 'Consider the following multi-threaded C snippet using POSIX mutex locks. Which condition causes a classic deadlock?',
    codeSnippet: `// Thread 1:
pthread_mutex_lock(&lock_A);
pthread_mutex_lock(&lock_B);

// Thread 2:
pthread_mutex_lock(&lock_B);
pthread_mutex_lock(&lock_A);`,
    options: [
      { id: 'A', text: 'Spurious thread wakeups occurring on condition variables.' },
      { id: 'B', text: 'Circular wait condition caused by non-uniform acquisition ordering of locks A and B.' },
      { id: 'C', text: 'Priority inversion when Thread 2 runs with SCHED_FIFO scheduling.' },
      { id: 'D', text: 'Buffer overrun in the POSIX thread attribute stack allocation.' },
    ],
    correctOptionId: 'B',
    points: 2,
    explanation: 'A circular wait is created when Thread 1 holds lock A waiting for lock B while Thread 2 holds lock B waiting for lock A. Imposing a global strict lock ordering prevents this Coffman condition.',
    category: 'Concurrency'
  },
  {
    id: 'q_csc_03',
    examId: 'exam_csc_401',
    questionNumber: 3,
    text: 'Which scheduling algorithm is provably optimal in terms of minimizing the average waiting time for a given set of stationary, non-preemptive processes?',
    options: [
      { id: 'A', text: 'First-Come, First-Served (FCFS)' },
      { id: 'B', text: 'Round-Robin (RR) with quantum q = 10ms' },
      { id: 'C', text: 'Shortest Job First (SJF)' },
      { id: 'D', text: 'Multi-Level Feedback Queue (MLFQ)' },
    ],
    correctOptionId: 'C',
    points: 2,
    explanation: 'Shortest Job First (SJF) is mathematically provable to yield the minimum average waiting time by scheduling shorter bursts before longer ones.',
    category: 'CPU Scheduling'
  },
  {
    id: 'q_csc_04',
    examId: 'exam_csc_401',
    questionNumber: 4,
    text: 'In distributed consensus algorithms like Raft, what mechanism ensures that no two leaders are elected for the exact same term?',
    options: [
      { id: 'A', text: 'Each candidate node requires a strict majority (quorum: > N/2) of peer votes in that term.' },
      { id: 'B', text: 'Atomic clocks synced via NTP with microsecond precision locks.' },
      { id: 'C', text: 'Hardware trusted platform module (TPM) counters.' },
      { id: 'D', text: 'Round-robin deterministic leader token passing.' },
    ],
    correctOptionId: 'A',
    points: 2,
    explanation: 'In Raft, a candidate must receive votes from a strict majority of cluster nodes for a given term, ensuring at most one candidate can win election for that term.',
    category: 'Distributed Systems'
  },
  {
    id: 'q_csc_05',
    examId: 'exam_csc_401',
    questionNumber: 5,
    text: 'What is the phenomenon known as "Thrashing" in an operating system?',
    options: [
      { id: 'A', text: 'When the CPU core temperatures exceed thermal thresholds causing frequency throttling.' },
      { id: 'B', text: 'When a system spends significantly more time paging memory in and out than executing instructions.' },
      { id: 'C', text: 'When network packet collisions exceed CSMA/CD maximum retry counts.' },
      { id: 'D', text: 'When disk heads rapidly oscillate without completing seek operations.' },
    ],
    correctOptionId: 'B',
    points: 2,
    explanation: 'Thrashing occurs when the total working set size of running processes exceeds physical RAM capacity, causing high-frequency page faults and memory swapping bottlenecks.',
    category: 'Memory Management'
  },
  {
    id: 'q_csc_06',
    examId: 'exam_csc_401',
    questionNumber: 6,
    text: 'In Unix-like systems, what happens to a child process if the parent process terminates without calling `wait()` or `waitpid()`?',
    options: [
      { id: 'A', text: 'The child process is immediately terminated via SIGKILL.' },
      { id: 'B', text: 'The child process is adopted by the init process (PID 1 or systemd) to reap its termination status.' },
      { id: 'C', text: 'The child process becomes permanently stuck in an uninterruptible kernel sleep (D state).' },
      { id: 'D', text: 'The operating system issues a kernel panic error code 0x80.' },
    ],
    correctOptionId: 'B',
    points: 2,
    explanation: 'Orphaned child processes are adopted by the root init/systemd process (PID 1), which periodically reaps them upon termination to prevent persistent zombie entries.',
    category: 'Process Management'
  },
  {
    id: 'q_csc_07',
    examId: 'exam_csc_401',
    questionNumber: 7,
    text: 'Which file system architecture feature allows atomic recovery from unexpected power loss without running a full disk integrity sweep (fsck)?',
    options: [
      { id: 'A', text: 'Write-ahead Journaling (e.g., ext4, XFS)' },
      { id: 'B', text: 'Sector interleaving' },
      { id: 'C', text: 'FAT32 file allocation cluster table' },
      { id: 'D', text: 'Direct memory access DMA mapping' },
    ],
    correctOptionId: 'A',
    points: 2,
    explanation: 'Journaling writes metadata and transaction records to a dedicated circular journal area before applying changes, enabling fast recovery by replaying or rolling back committed log transactions.',
    category: 'Storage Systems'
  },
  {
    id: 'q_csc_08',
    examId: 'exam_csc_401',
    questionNumber: 8,
    text: 'What distinguishes a kernel-level thread from a user-level green thread in terms of context switching overhead?',
    options: [
      { id: 'A', text: 'User threads require a ring-0 privilege mode transition, whereas kernel threads do not.' },
      { id: 'B', text: 'Kernel threads require a privilege level change (ring-3 to ring-0) and kernel scheduling intervention, making context switches heavier.' },
      { id: 'C', text: 'Kernel threads cannot run across multiple physical CPU cores simultaneously.' },
      { id: 'D', text: 'User threads cannot perform non-blocking asynchronous I/O.' },
    ],
    correctOptionId: 'B',
    points: 2,
    explanation: 'Kernel thread switches require switching CPU execution privilege rings (user to kernel mode) and altering kernel PCB structures, whereas user threads switch within the user-space runtime stack.',
    category: 'Concurrency'
  }
];

export const SEED_QUESTIONS_SEC302: Question[] = [
  {
    id: 'q_sec_01',
    examId: 'exam_sec_302',
    questionNumber: 1,
    text: 'Which cryptographic property ensures that a sender cannot falsely deny having authored or dispatched a specific message or transaction?',
    options: [
      { id: 'A', text: 'Confidentiality' },
      { id: 'B', text: 'Non-Repudiation' },
      { id: 'C', text: 'Perfect Forward Secrecy' },
      { id: 'D', text: 'Semantic Security' },
    ],
    correctOptionId: 'B',
    points: 2,
    explanation: 'Non-repudiation, commonly achieved through asymmetric digital signatures, provides undeniable cryptographic proof of authorship and origin.',
    category: 'Cryptography'
  },
  {
    id: 'q_sec_02',
    examId: 'exam_sec_302',
    questionNumber: 2,
    text: 'In AES-GCM (Galois/Counter Mode), what critical failure occurs if an initialization vector (IV / Nonce) is accidentally reused with the same secret key?',
    options: [
      { id: 'A', text: 'The ciphertext length increases exponentially.' },
      { id: 'B', text: 'Authentication key (GHASH) recovery and plaintext leakage via XOR difference cancellation.' },
      { id: 'C', text: 'The CPU execution pipeline enters an infinite decryption trap.' },
      { id: 'D', text: 'The key size automatically degrades to 56-bit DES.' },
    ],
    correctOptionId: 'B',
    points: 2,
    explanation: 'Reusing a nonce in AES-GCM breaks the counter stream (allowing XOR of plaintexts) and allows an attacker to compute the GHASH authentication subkey, destroying both integrity and secrecy.',
    category: 'Symmetric Cryptography'
  },
  {
    id: 'q_sec_03',
    examId: 'exam_sec_302',
    questionNumber: 3,
    text: 'What security mechanism in web browsers prevents Cross-Site Request Forgery (CSRF) on state-changing API endpoints?',
    options: [
      { id: 'A', text: 'SameSite cookie attributes (Strict/Lax) and Anti-CSRF cryptographically random tokens.' },
      { id: 'B', text: 'Enabling HTTP Keep-Alive headers on server responses.' },
      { id: 'C', text: 'Disabling client-side JavaScript console logging.' },
      { id: 'D', text: 'Increasing the DNS TTL record caching duration.' },
    ],
    correctOptionId: 'A',
    points: 2,
    explanation: 'SameSite cookie attributes and unpredictable synchronized CSRF tokens ensure cross-origin malicious sites cannot forge legitimate authenticated state mutations.',
    category: 'Web Security'
  },
  {
    id: 'q_sec_04',
    examId: 'exam_sec_302',
    questionNumber: 4,
    text: 'What is the purpose of Ephemeral Diffie-Hellman (ECDHE) key exchange in TLS 1.3?',
    options: [
      { id: 'A', text: 'To achieve Perfect Forward Secrecy (PFS) so past session traffic cannot be decrypted if the server private key is compromised later.' },
      { id: 'B', text: 'To compress HTTP headers and reduce latency on mobile networks.' },
      { id: 'C', text: 'To store static passwords on the server certificate authority.' },
      { id: 'D', text: 'To eliminate the need for TCP handshakes.' },
    ],
    correctOptionId: 'A',
    points: 2,
    explanation: 'Ephemeral Diffie-Hellman generates fresh, discarded session keypairs for every handshake, guaranteeing that long-term server key leaks cannot decrypt previously captured traffic.',
    category: 'Network Security'
  },
  {
    id: 'q_sec_05',
    examId: 'exam_sec_302',
    questionNumber: 5,
    text: 'In backend database queries, what is the mathematically foolproof architectural defense against SQL Injection attacks?',
    options: [
      { id: 'A', text: 'Parameterized queries (Prepared Statements) with separate lexical parsing and data binding.' },
      { id: 'B', text: 'Blacklisting single quote and semicolon characters with regex replace.' },
      { id: 'C', text: 'Using SHA-1 to hash user input strings before SQL concatenation.' },
      { id: 'D', text: 'Running the database engine strictly inside a Docker container.' },
    ],
    correctOptionId: 'A',
    points: 2,
    explanation: 'Parameterized queries compile the SQL query abstract syntax tree before injecting data variables, treating user inputs strictly as literal values rather than executable SQL syntax.',
    category: 'Application Security'
  }
];

export const SEED_EXAMS: Exam[] = [
  {
    id: 'exam_csc_401',
    title: 'CSC 401: Advanced Operating Systems & Distributed Architecture',
    code: 'CSC-401-2026',
    category: 'Computer Science',
    description: 'Comprehensive evaluation covering virtual memory hierarchies, lock-free concurrency, kernel context switches, distributed consensus (Raft), and POSIX scheduling primitives.',
    durationMinutes: 45,
    totalQuestions: 8,
    passingScorePercent: 70,
    status: 'published',
    instructions: [
      'This examination consists of 8 comprehensive multiple-choice questions.',
      'Total allocated duration is 45 minutes with an automatic submission countdown.',
      'Every answer selection is securely hashed and synchronized in real-time to the cloud database.',
      'Navigating away from the active tab or minimizing the window will trigger security audit log alerts.',
      'You may flag questions for review and navigate freely using the question palette prior to final submission.',
      'Once final submission is confirmed, your responses will be cryptographically sealed with a SHA-256 integrity receipt.'
    ],
    randomizeQuestions: false,
    randomizeOptions: false,
    showResultsImmediately: true,
    createdAt: '2026-02-15T09:00:00.000Z',
    updatedAt: '2026-08-20T10:00:00.000Z',
    questions: SEED_QUESTIONS_CSC401
  },
  {
    id: 'exam_sec_302',
    title: 'SEC 302: Applied Cryptography & Information Security',
    code: 'SEC-302-2026',
    category: 'Cybersecurity',
    description: 'Rigorous assessment on symmetric/asymmetric cryptographic protocols, TLS 1.3 handshake flows, zero-knowledge proofs, and anti-tamper checksum architecture.',
    durationMinutes: 30,
    totalQuestions: 5,
    passingScorePercent: 75,
    status: 'published',
    instructions: [
      'Total duration: 30 minutes. Strict timed auto-submission is enforced.',
      'Calculators and outside reference materials are strictly prohibited.',
      'Each question awards 2 points. No negative marking is applied for incorrect attempts.',
      'Real-time background state persistence is active throughout the test.'
    ],
    randomizeQuestions: false,
    randomizeOptions: false,
    showResultsImmediately: true,
    createdAt: '2026-02-18T11:00:00.000Z',
    updatedAt: '2026-08-21T15:30:00.000Z',
    questions: SEED_QUESTIONS_SEC302
  },
  {
    id: 'exam_net_201',
    title: 'NET 201: Computer Networks & Protocol Engineering',
    code: 'NET-201-2026',
    category: 'Networking',
    description: 'Protocol-level analysis spanning TCP congestion control, BGP path vector routing, IPv6 addressing schemes, and HTTP/3 QUIC stream multiplexing.',
    durationMinutes: 40,
    totalQuestions: 6,
    passingScorePercent: 65,
    status: 'published',
    instructions: [
      'Ensure a stable network connection before starting.',
      'All answers are persisted after every click with sub-second background latency.',
      'You can review and modify your answers until time expires.'
    ],
    randomizeQuestions: false,
    randomizeOptions: false,
    showResultsImmediately: true,
    createdAt: '2026-02-20T08:00:00.000Z',
    updatedAt: '2026-08-22T12:00:00.000Z',
    questions: [
      {
        id: 'q_net_01',
        examId: 'exam_net_201',
        questionNumber: 1,
        text: 'What transport-layer protocol does HTTP/3 utilize to eliminate Head-of-Line (HoL) blocking on multiplexed streams?',
        options: [
          { id: 'A', text: 'UDP via the QUIC protocol' },
          { id: 'B', text: 'TCP with Fast Open (TFO) extensions' },
          { id: 'C', text: 'SCTP (Stream Control Transmission Protocol)' },
          { id: 'D', text: 'Raw ICMP echo encapsulation' },
        ],
        correctOptionId: 'A',
        points: 2,
        explanation: 'HTTP/3 runs over QUIC (built on top of UDP), which provides independent stream multiplexing so a single packet loss does not stall other unrelated streams.',
        category: 'Protocols'
      },
      {
        id: 'q_net_02',
        examId: 'exam_net_201',
        questionNumber: 2,
        text: 'In IPv4 subnetting, how many usable host IP addresses are available in a `/28` CIDR subnet block?',
        options: [
          { id: 'A', text: '14 usable host addresses (16 total minus Network and Broadcast)' },
          { id: 'B', text: '16 usable host addresses' },
          { id: 'C', text: '30 usable host addresses' },
          { id: 'D', text: '12 usable host addresses' },
        ],
        correctOptionId: 'A',
        points: 2,
        explanation: 'A /28 subnet has 32 - 28 = 4 host bits, yielding 2^4 = 16 total IPs. Subtracting the network ID and broadcast address leaves 14 usable host addresses.',
        category: 'Subnetting'
      }
    ]
  }
];

export const SEED_SECURITY_LOGS: SecurityLogEvent[] = [
  {
    id: 'sec_evt_101',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    eventType: 'AUTH_SUCCESS',
    severity: 'low',
    sourceIp: '192.168.1.104',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0',
    actorId: 'cand_001',
    actorEmail: 'kosi.nwafor@mapoly.edu.ng',
    actorRole: 'candidate',
    endpoint: '/api/v1/auth/candidate/login',
    details: 'Candidate authenticated successfully via matriculation credential validation.',
    resolved: true,
  },
  {
    id: 'sec_evt_102',
    timestamp: new Date(Date.now() - 1000 * 60 * 21).toISOString(),
    eventType: 'RATE_LIMIT_TRIGGERED',
    severity: 'medium',
    sourceIp: '10.0.4.88',
    userAgent: 'Python-requests/2.31.0',
    actorId: 'anonymous',
    actorEmail: 'unknown@external-ip.net',
    actorRole: 'anonymous',
    endpoint: '/api/v1/auth/login',
    details: 'Rate limit burst exceeded: 38 POST requests within 3.2s on /api/v1/auth/login. IP temporarily throttled (HTTP 429).',
    resolved: true,
  },
  {
    id: 'sec_evt_103',
    timestamp: new Date(Date.now() - 1000 * 60 * 16).toISOString(),
    eventType: 'AUTH_FAILURE',
    severity: 'high',
    sourceIp: '198.51.100.23',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
    actorId: 'cand_004',
    actorEmail: 'alex.v@mapoly.edu.ng',
    actorRole: 'candidate',
    endpoint: '/api/v1/auth/candidate/login',
    details: 'Failed candidate authentication attempt (invalid password hash match). Failure count: 3.',
    resolved: false,
  },
  {
    id: 'sec_evt_104',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    eventType: 'UNAUTHORIZED_ACCESS_ATTEMPT',
    severity: 'critical',
    sourceIp: '198.51.100.23',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
    actorId: 'cand_004',
    actorEmail: 'alex.v@mapoly.edu.ng',
    actorRole: 'candidate',
    endpoint: '/api/v1/auth/candidate/login',
    details: 'Account temporarily locked after 5 consecutive failed authentication attempts. Lock duration: 15 minutes.',
    resolved: false,
  },
  {
    id: 'sec_evt_105',
    timestamp: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
    eventType: 'AUTH_SUCCESS',
    severity: 'low',
    sourceIp: '192.168.1.104',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0',
    actorId: 'cand_001',
    actorEmail: 'kosi.nwafor@mapoly.edu.ng',
    actorRole: 'candidate',
    examId: 'exam_csc_401',
    endpoint: '/api/v1/exams/exam_csc_401/answers',
    details: 'Background answer packet response_q_csc_01 saved with valid SHA-256 HMAC digest (latency: 78ms).',
    payloadChecksum: '0x3F8A7D1E9B0C4A5F',
    resolved: true,
  },
  {
    id: 'sec_evt_106',
    timestamp: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
    eventType: 'TAB_SWITCH_SUSPECT',
    severity: 'high',
    sourceIp: '192.168.1.112',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    actorId: 'cand_002',
    actorEmail: 'sarah.j@mapoly.edu.ng',
    actorRole: 'candidate',
    examId: 'exam_csc_401',
    endpoint: '/api/v1/exams/proctor/focus',
    details: 'Candidate window lost focus during active timed exam (PageVisibility event: hidden, 8.4s duration).',
    resolved: false,
  },
  {
    id: 'sec_evt_107',
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    eventType: 'CHECKSUM_MISMATCH',
    severity: 'critical',
    sourceIp: '172.16.0.44',
    userAgent: 'PostmanRuntime/7.36.0',
    actorId: 'cand_003',
    actorEmail: 'david.chen@mapoly.edu.ng',
    actorRole: 'candidate',
    examId: 'exam_sec_302',
    endpoint: '/api/v1/exams/exam_sec_302/answers',
    details: 'Incoming answer write payload checksum failed server-side SHA-256 HMAC verification. Potential client tampering intercepted.',
    payloadChecksum: 'TAMPERED_0x9A8B7C6D5E',
    resolved: false,
  },
  {
    id: 'sec_evt_108',
    timestamp: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
    eventType: 'AUTH_SUCCESS',
    severity: 'low',
    sourceIp: '192.168.1.104',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0',
    actorId: 'cand_001',
    actorEmail: 'kosi.nwafor@mapoly.edu.ng',
    actorRole: 'candidate',
    examId: 'exam_csc_401',
    endpoint: '/api/v1/exams/exam_csc_401/submit',
    details: 'Examination CSC 401 submitted. Cryptographic scorecard sealed with receipt TX-CBT-7F4B2A91D0E3-5C82A1.',
    payloadChecksum: 'TX-CBT-7F4B2A91D0E3-5C82A1',
    resolved: true,
  }
];

export const SEED_RESULTS: ExamResult[] = [
  {
    id: 'res_001',
    examId: 'exam_csc_401',
    examTitle: 'CSC 401: Advanced Operating Systems & Distributed Architecture',
    examCode: 'CSC-401-2026',
    candidateId: 'cand_001',
    candidateName: 'Kosisochukwu Nwafor',
    candidateRegNumber: 'CBT/2026/CS/0492',
    score: 14,
    totalScore: 16,
    percentage: 87.5,
    passed: true,
    passingScorePercent: 70,
    startedAt: '2026-08-20T10:00:00.000Z',
    completedAt: '2026-08-20T10:32:15.000Z',
    timeTakenSeconds: 1935,
    tabSwitchCount: 0,
    receiptChecksum: 'TX-CBT-7F4B2A91D0E3-5C82A1',
    integrityVerified: true,
    breakdown: [
      {
        questionId: 'q_csc_01',
        questionText: 'In modern multi-core operating systems, what is the primary purpose of the Translation Lookaside Buffer (TLB)?',
        selectedOptionId: 'A',
        correctOptionId: 'A',
        isCorrect: true,
        pointsEarned: 2,
        totalPoints: 2,
        explanation: 'The TLB is a memory management hardware cache that stores recent translations of virtual memory to physical addresses.'
      },
      {
        questionId: 'q_csc_02',
        questionText: 'Consider the following multi-threaded C snippet using POSIX mutex locks. Which condition causes a classic deadlock?',
        selectedOptionId: 'B',
        correctOptionId: 'B',
        isCorrect: true,
        pointsEarned: 2,
        totalPoints: 2,
        explanation: 'A circular wait is created when Thread 1 holds lock A waiting for lock B while Thread 2 holds lock B waiting for lock A.'
      },
      {
        questionId: 'q_csc_03',
        questionText: 'Which scheduling algorithm is provably optimal in terms of minimizing average waiting time for a given set of stationary, non-preemptive processes?',
        selectedOptionId: 'C',
        correctOptionId: 'C',
        isCorrect: true,
        pointsEarned: 2,
        totalPoints: 2,
        explanation: 'Shortest Job First (SJF) is provably optimal.'
      },
      {
        questionId: 'q_csc_04',
        questionText: 'In distributed consensus algorithms like Raft, what mechanism ensures that no two leaders are elected for the exact same term?',
        selectedOptionId: 'A',
        correctOptionId: 'A',
        isCorrect: true,
        pointsEarned: 2,
        totalPoints: 2,
        explanation: 'In Raft, a candidate must receive votes from a strict majority (> N/2).'
      },
      {
        questionId: 'q_csc_05',
        questionText: 'What is the phenomenon known as "Thrashing" in an operating system?',
        selectedOptionId: 'B',
        correctOptionId: 'B',
        isCorrect: true,
        pointsEarned: 2,
        totalPoints: 2,
        explanation: 'Thrashing occurs when the system spends more time paging than executing instructions.'
      },
      {
        questionId: 'q_csc_06',
        questionText: 'In Unix-like systems, what happens to a child process if the parent process terminates without calling wait()?',
        selectedOptionId: 'B',
        correctOptionId: 'B',
        isCorrect: true,
        pointsEarned: 2,
        totalPoints: 2,
        explanation: 'Orphaned child processes are adopted by init/systemd (PID 1).'
      },
      {
        questionId: 'q_csc_07',
        questionText: 'Which file system architecture feature allows atomic recovery from unexpected power loss without running a full disk integrity sweep (fsck)?',
        selectedOptionId: 'A',
        correctOptionId: 'A',
        isCorrect: true,
        pointsEarned: 2,
        totalPoints: 2,
        explanation: 'Journaling records transactions before applying them to the file system.'
      },
      {
        questionId: 'q_csc_08',
        questionText: 'What distinguishes a kernel-level thread from a user-level green thread in terms of context switching overhead?',
        selectedOptionId: 'A',
        correctOptionId: 'B',
        isCorrect: false,
        pointsEarned: 0,
        totalPoints: 2,
        explanation: 'Kernel thread switches require ring-3 to ring-0 mode transitions and kernel scheduler intervention.'
      }
    ]
  }
];
