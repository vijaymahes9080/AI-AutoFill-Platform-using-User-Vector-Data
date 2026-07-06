// AutoFlow AI — Core Application Logic and RAG Simulator
// Author: Antigravity AI Systems Architect

// -------------------------------------------------------------
// 1. Vector RAG Engine (TF-IDF & Cosine Similarity in JavaScript)
// -------------------------------------------------------------
class VectorRAGEngine {
  constructor() {
    this.vectors = []; // Array of { id, text, vectorType, category, key, label, value, tokens, magnitude }
    this.stopwords = new Set(['and', 'the', 'is', 'in', 'at', 'of', 'for', 'to', 'with', 'a', 'an', 'your', 'please', 'enter', 'input', 'select']);
  }

  // Tokenize and clean text
  tokenize(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .split(/[\s_-]+/)
      .filter(t => t.length > 1 && !this.stopwords.has(t));
  }

  // Generate frequency vector
  getTermFreq(tokens) {
    const freq = {};
    tokens.forEach(token => {
      freq[token] = (freq[token] || 0) + 1;
    });
    return freq;
  }

  // Calculate magnitude of a vector
  getMagnitude(freq) {
    let sum = 0;
    for (const key in freq) {
      sum += freq[key] * freq[key];
    }
    return Math.sqrt(sum);
  }

  // Add document/profile item to Vector Store
  addDocument(id, text, vectorType, category, key, label, value, customSynonyms = "") {
    const tokens = this.tokenize(`${key} ${label} ${text} ${value} ${customSynonyms}`);
    const freq = this.getTermFreq(tokens);
    const magnitude = this.getMagnitude(freq);

    this.vectors.push({
      id,
      text: text + (customSynonyms ? " " + customSynonyms : ""),
      vectorType, // 'identity', 'context', 'knowledge'
      category,   // 'personal', 'work', 'education', 'preference'
      key,
      label,
      value,
      tokens,
      freq,
      magnitude
    });
  }

  // Get detailed similarity scoring breakdown for Inspector
  getDetailedSimilarityMatches(queryString) {
    const queryTokens = this.tokenize(queryString);
    if (queryTokens.length === 0) return [];

    const queryFreq = this.getTermFreq(queryTokens);
    const queryMagnitude = this.getMagnitude(queryFreq);

    const matches = this.vectors.map(doc => {
      const score = this.cosineSimilarity(queryFreq, queryMagnitude, doc);
      const tokensMatched = doc.tokens.filter(t => queryFreq[t]);
      return {
        item: doc,
        score: score,
        tokensMatched: tokensMatched
      };
    });

    return matches.sort((a, b) => b.score - a.score);
  }

  // Compute Cosine Similarity between query tokens and vector item
  cosineSimilarity(queryFreq, queryMagnitude, doc) {
    let dotProduct = 0;
    let intersections = 0;

    for (const term in queryFreq) {
      if (doc.freq[term]) {
        dotProduct += queryFreq[term] * doc.freq[term];
        intersections++;
      }
    }

    if (queryMagnitude === 0 || doc.magnitude === 0) return 0;

    // Apply soft booster for exact category/key matches
    let similarity = dotProduct / (queryMagnitude * doc.magnitude);
    
    // Boost score if keyword overlapping is high
    if (intersections > 0) {
      similarity += (intersections / Object.keys(queryFreq).length) * 0.15;
    }

    return Math.min(similarity, 1.0);
  }

  // Search vector store for best matching item
  query(queryString, limit = 3) {
    const queryTokens = this.tokenize(queryString);
    if (queryTokens.length === 0) return [];

    const queryFreq = this.getTermFreq(queryTokens);
    const queryMagnitude = this.getMagnitude(queryFreq);

    const matches = this.vectors.map(doc => {
      const score = this.cosineSimilarity(queryFreq, queryMagnitude, doc);
      return {
        item: doc,
        score: score
      };
    });

    // Filter out zero similarity and sort descending
    return matches
      .filter(m => m.score > 0.05)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

// -------------------------------------------------------------
// 2. Encryption Engine Simulator (Visual Security Layers)
// -------------------------------------------------------------
const CryptoSimulator = {
  // Simulate client-side encryption showing visual hex
  encrypt(text, masterPassword) {
    if (!text) return { ciphertext: '', iv: '' };
    // Simulate salt and IV
    const iv = Array.from({ length: 12 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    // Simulating simple character shift hashing representing AES-GCM-256
    let hash = 0;
    for (let i = 0; i < masterPassword.length; i++) {
      hash += masterPassword.charCodeAt(i);
    }
    const cipherArr = Array.from(text).map(char => {
      const charCode = char.charCodeAt(0);
      const encryptedCode = (charCode + hash) % 65536;
      return encryptedCode.toString(16).padStart(4, '0');
    });
    return {
      ciphertext: '0x' + cipherArr.join(''),
      iv: 'iv_' + iv
    };
  },

  decrypt(ciphertext, iv, masterPassword) {
    if (!ciphertext || !ciphertext.startsWith('0x')) return '';
    let hash = 0;
    for (let i = 0; i < masterPassword.length; i++) {
      hash += masterPassword.charCodeAt(i);
    }
    const hex = ciphertext.slice(2);
    const chars = [];
    for (let i = 0; i < hex.length; i += 4) {
      const encryptedCode = parseInt(hex.substring(i, i + 4), 16);
      let charCode = (encryptedCode - hash) % 65536;
      if (charCode < 0) charCode += 65536;
      chars.push(String.fromCharCode(charCode));
    }
    return chars.join('');
  }
};

// -------------------------------------------------------------
// 3. User Seed Data & Default Platform State
// -------------------------------------------------------------
const INITIAL_PROFILE = {
  // Personal Info
  fullName: "Alexander Wright",
  email: "alexander.wright@techinnovate.io",
  phone: "+1 (555) 349-2048",
  linkedin: "linkedin.com/in/alex-wright-dev",
  github: "github.com/alexwright-ai",
  website: "alexwright.dev",
  address: "742 Evergreen Terrace, San Francisco, CA 94107",
  
  // Work History
  jobTitle: "Lead AI Integration Architect",
  company: "Cognitive Automation Systems",
  experience: "8 years in Full-stack architecture & LLM orchestration",
  skills: "Node.js, Python, FastAPI, React, PostgreSQL, pgvector, LangChain, Browser Automation",
  bio: "Experienced developer bridging AI systems, secure vector identity layers, and web interfaces. Passionate about local-first privacy, client-side encryption, and agentic workflows.",
  
  // Education
  education: "M.S. in Computer Science, Stanford University (2018)",
  certifications: "AWS Solutions Architect, TensorFlow Developer Certification",

  // Context Vectors / Task preferences
  salaryExpectation: "$165,000 - $185,000 USD",
  noticePeriod: "2 weeks",
  workSetting: "Hybrid / Remote (San Francisco)",
  sponsorshipNeeded: "No",
  authorizedToWork: "Yes"
};

// Store files uploaded to simulator
const UPLOADED_DOCUMENTS = [
  {
    name: "Alexander_Wright_Resume.pdf",
    size: "245 KB",
    uploadedAt: "2026-06-21 14:32",
    content: "Alexander Wright, Lead AI Integration Architect based in San Francisco. 8 years developer experience. Specialize in FastAPI backends, React, pgvector databases, Chrome extensions, and browser-use agents. Stanford University graduate. Managed teams of 5 developers."
  },
  {
    name: "Stanford_Diploma_Verification.pdf",
    size: "1.2 MB",
    uploadedAt: "2026-06-22 09:15",
    content: "Stanford University School of Engineering hereby certifies that Alexander Wright completed the requirements for Master of Science in Computer Science in June 2018."
  }
];

// Initial site-level permissions mapping
const DEFAULT_PERMISSIONS = [
  { domain: "greenhouse.io", category: "all", accessType: "always_allow", status: "Active" },
  { domain: "lever.co", category: "personal_only", accessType: "ask_each_time", status: "Active" },
  { domain: "stripe.com", category: "all", accessType: "one_time", status: "Expiring soon" },
  { domain: "workday.com", category: "work_data", accessType: "always_allow", status: "Active" }
];

// Seed Audit logs
const SEED_AUDIT_LOGS = [
  { time: "18:24:10", domain: "greenhouse.io/careers/engineer", action: "Form Auto-filled", status: "Success", confidence: "98%", fields: 9 },
  { time: "17:15:32", domain: "linkedin.com/jobs", action: "Profile Context Syched", status: "Success", confidence: "100%", fields: 5 },
  { time: "14:02:11", domain: "lever.co/stripe/apply", action: "Resume Parsed via RAG", status: "Reviewed", confidence: "91%", fields: 12 },
  { time: "Yesterday", domain: "airbnb.com/host/signup", action: "Identity fields autofilled", status: "Success", confidence: "95%", fields: 4 }
];

// Form templates for playground
const FORM_PLAYGROUND_TEMPLATES = {
  job: {
    title: "Greenhouse Tech Job Application",
    description: "Typical ATS multi-step recruitment application form.",
    fields: [
      { id: "full_name", type: "text", label: "Full Name", placeholder: "First & Last Name", required: true },
      { id: "contact_email", type: "email", label: "Email Address", placeholder: "name@company.com", required: true },
      { id: "phone_number", type: "tel", label: "Phone Number", placeholder: "+1 (555) 000-0000", required: true },
      { id: "linkedin_profile", type: "text", label: "LinkedIn URL", placeholder: "linkedin.com/in/username", required: false },
      { id: "github_profile", type: "text", label: "GitHub Profile", placeholder: "github.com/username", required: false },
      { id: "job_title", type: "text", label: "Desired Role / Title", placeholder: "e.g. Senior Software Engineer", required: true },
      { id: "cover_letter_bio", type: "textarea", label: "Professional Summary / Bio", placeholder: "Write a short summary about yourself...", required: true },
      { id: "work_preference", type: "select", label: "Preferred Work Setting", placeholder: "Select an option", options: ["Remote", "Hybrid", "In-office"], required: false },
      { id: "salary_requirement", type: "text", label: "Target Salary Expectation", placeholder: "Desired compensation range", required: false }
    ]
  },
  onboarding: {
    title: "SaaS Enterprise Account Creation",
    description: "Workspace onboarding form asking for company size, stack, and contact data.",
    fields: [
      { id: "user_name", type: "text", label: "Your Full Name", placeholder: "Enter name", required: true },
      { id: "business_email", type: "email", label: "Work Email", placeholder: "you@company.com", required: true },
      { id: "role_select", type: "select", label: "What is your main job title?", placeholder: "Select title", options: ["Lead Architect", "Engineering Manager", "Product Manager", "Other"], required: true },
      { id: "company_name", type: "text", label: "Organization / Company Name", placeholder: "Company LLC", required: true },
      { id: "work_address", type: "text", label: "Company Office Address", placeholder: "Street, City, Zip", required: false },
      { id: "tech_skills", type: "textarea", label: "Technical Stack Preferences", placeholder: "e.g. React, Node.js, Python", required: false }
    ]
  },
  ecommerce: {
    title: "Checkout & Subscription Form",
    description: "Simulates checkout and user billing profiles.",
    fields: [
      { id: "bill_name", type: "text", label: "Billing Name", placeholder: "Name on credit card", required: true },
      { id: "bill_email", type: "email", label: "Receipt Email Address", placeholder: "invoice@domain.com", required: true },
      { id: "bill_phone", type: "tel", label: "Contact Phone", placeholder: "+1 ...", required: true },
      { id: "ship_address", type: "textarea", label: "Shipping / Billing Address", placeholder: "Complete address...", required: true },
      { id: "coupon_code", type: "text", label: "Promo Code / Referral Intent", placeholder: "Enter code if any", required: false }
    ]
  }
};

// -------------------------------------------------------------
// 4. App Orchestration State & Initialization
// -------------------------------------------------------------
class AutoFlowApp {
  constructor() {
    this.ragEngine = new VectorRAGEngine();
    this.masterPassword = "SecurePass123!_UserKey"; // Mock master key
    this.activeTab = "dashboard";
    this.activePlaygroundForm = "job";
    this.isAutofilled = false;
    this.showFloatingPanel = true;
    this.activeExtensionTab = "fill"; // Tab within Extension Panel: 'fill' or 'inspect'
    this.selectedInspectorField = ""; // Active field being inspected

    // Load data from LocalStorage or seed defaults
    this.loadState();
    this.seedVectorEngine();
  }

  loadState() {
    this.profile = JSON.parse(localStorage.getItem('autoflow_profile')) || { ...INITIAL_PROFILE };
    this.documents = JSON.parse(localStorage.getItem('autoflow_docs')) || [ ...UPLOADED_DOCUMENTS ];
    this.permissions = JSON.parse(localStorage.getItem('autoflow_permissions')) || [ ...DEFAULT_PERMISSIONS ];
    this.auditLogs = JSON.parse(localStorage.getItem('autoflow_audit')) || [ ...SEED_AUDIT_LOGS ];
    this.vectorSynonyms = JSON.parse(localStorage.getItem('autoflow_synonyms')) || {};
  }

  saveState() {
    localStorage.setItem('autoflow_profile', JSON.stringify(this.profile));
    localStorage.setItem('autoflow_docs', JSON.stringify(this.documents));
    localStorage.setItem('autoflow_permissions', JSON.stringify(this.permissions));
    localStorage.setItem('autoflow_audit', JSON.stringify(this.auditLogs));
    localStorage.setItem('autoflow_synonyms', JSON.stringify(this.vectorSynonyms));
  }

  // Register a custom vector synonym
  addVectorSynonym(vectorId, synonymText) {
    const current = this.vectorSynonyms[vectorId] || "";
    this.vectorSynonyms[vectorId] = (current + " " + synonymText).trim();
    this.saveState();
    this.seedVectorEngine();
    return true;
  }

  // Hydrate Vector Engine with active data
  seedVectorEngine() {
    this.ragEngine.vectors = []; // Reset
    const getSyns = (id) => this.vectorSynonyms[id] || "";

    // 1. Index Profile Fields (Identity Vectors)
    this.ragEngine.addDocument("p_name", "full name first name last name identity user", "identity", "personal", "fullName", "Full Name", this.profile.fullName, getSyns("p_name"));
    this.ragEngine.addDocument("p_email", "email address contact mailbox receipt user", "identity", "personal", "email", "Email Address", this.profile.email, getSyns("p_email"));
    this.ragEngine.addDocument("p_phone", "phone number telephone cell mobile contact number", "identity", "personal", "phone", "Phone Number", this.profile.phone, getSyns("p_phone"));
    this.ragEngine.addDocument("p_linkedin", "linkedin profile url social link work networking url", "identity", "personal", "linkedin", "LinkedIn URL", this.profile.linkedin, getSyns("p_linkedin"));
    this.ragEngine.addDocument("p_github", "github profile developer repo portfolio user code source link", "identity", "personal", "github", "GitHub Profile", this.profile.github, getSyns("p_github"));
    this.ragEngine.addDocument("p_website", "personal website portfolio URL homepage domain link", "identity", "personal", "website", "Personal Website", this.profile.website, getSyns("p_website"));
    this.ragEngine.addDocument("p_address", "address shipping billing office address street state city zipcode", "identity", "personal", "address", "Address", this.profile.address, getSyns("p_address"));

    // 2. Index Work Fields (Work Vectors)
    this.ragEngine.addDocument("w_title", "job title role current title workspace desired position", "identity", "work", "jobTitle", "Job Title", this.profile.jobTitle, getSyns("w_title"));
    this.ragEngine.addDocument("w_company", "organization company name business employer current workspace", "identity", "work", "company", "Company", this.profile.company, getSyns("w_company"));
    this.ragEngine.addDocument("w_exp", "experience years professional job history background details", "identity", "work", "experience", "Work Experience", this.profile.experience, getSyns("w_exp"));
    this.ragEngine.addDocument("w_skills", "technical skills programming languages tech stack tools framework", "identity", "work", "skills", "Technical Skills", this.profile.skills, getSyns("w_skills"));
    this.ragEngine.addDocument("w_bio", "biography summary cover letter text about me professional profile summary", "identity", "work", "bio", "Professional Summary / Bio", this.profile.bio, getSyns("w_bio"));

    // 3. Index Education
    this.ragEngine.addDocument("e_edu", "education university college master degree cs study stanford qualification", "identity", "education", "education", "Education Details", this.profile.education, getSyns("e_edu"));
    this.ragEngine.addDocument("e_cert", "certifications awards credentials license AWS Solutions architect TensorFlow", "identity", "education", "certifications", "Certifications", this.profile.certifications, getSyns("e_cert"));

    // 4. Index Context preferences
    this.ragEngine.addDocument("c_sal", "salary requirement expectation target compensation desired pay range", "context", "preference", "salaryExpectation", "Salary Expectation", this.profile.salaryExpectation, getSyns("c_sal"));
    this.ragEngine.addDocument("c_notice", "notice period resignation start date availability weeks days", "context", "preference", "noticePeriod", "Notice Period", this.profile.noticePeriod, getSyns("c_notice"));
    this.ragEngine.addDocument("c_setting", "work setting preference remote hybrid office environment location", "context", "preference", "workSetting", "Preferred Work Setting", this.profile.workSetting, getSyns("c_setting"));
    this.ragEngine.addDocument("c_sponsor", "sponsorship needed visa work authorization legal status", "context", "preference", "sponsorshipNeeded", "Sponsorship Needed", this.profile.sponsorshipNeeded, getSyns("c_sponsor"));
    this.ragEngine.addDocument("c_auth", "authorized to work legal permit US citizen work authorization", "context", "preference", "authorizedToWork", "Authorized to Work", this.profile.authorizedToWork, getSyns("c_auth"));

    // 5. Index Uploaded Documents (Knowledge Vectors)
    this.documents.forEach((doc, idx) => {
      // Chunk document roughly by sentence structure
      const sentences = doc.content.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
      sentences.forEach((sentence, sIdx) => {
        this.ragEngine.addDocument(
          `doc_${idx}_chunk_${sIdx}`, 
          sentence, 
          "knowledge", 
          "document_chunk", 
          `doc_${idx}`, 
          doc.name, 
          sentence
        );
      });
    });
  }

  // Simulate scanning dynamic DOM elements of active playground form
  scanFormFields(formFields) {
    const matchedResults = [];

    formFields.forEach(field => {
      // Query the Vector Store combining ID, label, and placeholder attributes
      const queryStr = `${field.id} ${field.label} ${field.placeholder || ''}`;
      const searchHits = this.ragEngine.query(queryStr, 1);

      if (searchHits.length > 0 && searchHits[0].score > 0.15) {
        const hit = searchHits[0];
        matchedResults.push({
          fieldId: field.id,
          fieldLabel: field.label,
          type: field.type,
          options: field.options,
          suggestedValue: hit.item.value,
          score: hit.score,
          vectorId: hit.item.id,
          category: hit.item.category,
          sourceType: hit.item.vectorType,
          sourceDoc: hit.item.label
        });
      } else {
        // Fallback placeholder or empty
        matchedResults.push({
          fieldId: field.id,
          fieldLabel: field.label,
          type: field.type,
          options: field.options,
          suggestedValue: "",
          score: 0,
          vectorId: null,
          category: "none",
          sourceType: "none",
          sourceDoc: "None"
        });
      }
    });

    return matchedResults;
  }
}

// -------------------------------------------------------------
// 5. UI Rendering & Interactions Hook
// -------------------------------------------------------------
let app;
document.addEventListener("DOMContentLoaded", () => {
  app = new AutoFlowApp();
  initUI();
});

function initUI() {
  renderTabs();
  renderProfile();
  renderDocuments();
  renderPermissions();
  renderAuditLogs();
  renderPlaygroundForm();
  updateExtensionOverlay();
  renderTechDocs();
}

// Simple tab switcher
function switchTab(tabId) {
  app.activeTab = tabId;
  
  // Update nav buttons active classes
  document.querySelectorAll(".nav-btn").forEach(btn => {
    if (btn.getAttribute("data-tab") === tabId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Show/hide view panels
  document.querySelectorAll(".view-panel").forEach(panel => {
    if (panel.id === `${tabId}-view`) {
      panel.classList.remove("hidden");
    } else {
      panel.classList.add("hidden");
    }
  });

  // Trigger special actions based on tab
  if (tabId === "playground") {
    renderPlaygroundForm();
    updateExtensionOverlay();
  }
}

function renderTabs() {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      switchTab(btn.getAttribute("data-tab"));
    });
  });
}

// Render user profile management
function renderProfile() {
  const container = document.getElementById("profile-fields-container");
  if (!container) return;
  container.innerHTML = "";

  const sections = {
    "Personal Identity Data": ["fullName", "email", "phone", "address"],
    "Professional & Work Profile": ["jobTitle", "company", "experience", "skills", "bio"],
    "Context Preference Vectors": ["salaryExpectation", "noticePeriod", "workSetting", "sponsorshipNeeded", "authorizedToWork"]
  };

  for (const [sectionTitle, fields] of Object.entries(sections)) {
    const sectionWrapper = document.createElement("div");
    sectionWrapper.className = "profile-section-card glass-card p-6 mb-6";
    
    let html = `<h3 class="text-lg font-semibold text-indigo-400 border-b border-gray-800 pb-3 mb-4 flex justify-between items-center">
      <span>${sectionTitle}</span>
      <span class="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">Zero-Knowledge Encrypted</span>
    </h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">`;

    fields.forEach(key => {
      const value = app.profile[key];
      const cryptoSim = CryptoSimulator.encrypt(value, app.masterPassword);
      
      // Determine clean human label
      const humanLabel = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

      html += `
        <div class="form-group flex flex-col">
          <label class="text-xs font-semibold text-gray-400 mb-1 flex justify-between">
            <span>${humanLabel}</span>
            <span class="crypto-meta text-[10px] text-violet-400/80 cursor-pointer" onclick="toggleFieldEncryption(this, '${key}')" title="Click to view encrypted ciphertext">
              🔐 Encrypted (Click to inspect ciphertext)
            </span>
          </label>
          <input type="text" id="prof_${key}" value="${escapeHtml(value)}" onchange="updateProfileField('${key}', this.value)" 
                 class="bg-slate-900/60 border border-gray-800 focus:border-indigo-500 rounded p-2 text-sm text-gray-200 focus:outline-none transition-all duration-300">
          <div class="ciphertext-display text-[9px] text-gray-500 font-mono mt-1 break-all hidden max-h-16 overflow-y-auto p-1 bg-slate-950/80 rounded border border-violet-900/30">
            <strong>IV:</strong> ${cryptoSim.iv}<br>
            <strong>Cipher:</strong> ${cryptoSim.ciphertext}
          </div>
        </div>
      `;
    });

    html += `</div>`;
    sectionWrapper.innerHTML = html;
    container.appendChild(sectionWrapper);
  }
}

// Toggle display of ciphertext for encryption transparency
window.toggleFieldEncryption = function(element, fieldKey) {
  const cipherDiv = element.closest('.form-group').querySelector('.ciphertext-display');
  if (cipherDiv.classList.contains('hidden')) {
    cipherDiv.classList.remove('hidden');
    element.textContent = "🔓 View Decrypted Value";
    element.classList.add('text-indigo-400');
    element.classList.remove('text-violet-400/80');
  } else {
    cipherDiv.classList.add('hidden');
    element.textContent = "🔐 Encrypted (Click to inspect ciphertext)";
    element.classList.remove('text-indigo-400');
    element.classList.add('text-violet-400/80');
  }
};

window.updateProfileField = function(key, val) {
  app.profile[key] = val;
  app.saveState();
  app.seedVectorEngine();
  showToast(`Profile field '${key}' updated and re-vectorized.`);
};

// Render documents management
function renderDocuments() {
  const list = document.getElementById("document-list");
  if (!list) return;
  list.innerHTML = "";

  app.documents.forEach((doc, index) => {
    const card = document.createElement("div");
    card.className = "document-card glass-card p-4 flex items-center justify-between border-l-4 border-indigo-500";
    card.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="doc-icon text-indigo-400 text-2xl">📄</div>
        <div>
          <h4 class="text-sm font-semibold text-gray-200">${escapeHtml(doc.name)}</h4>
          <p class="text-xs text-gray-500">Size: ${doc.size} | Uploaded: ${doc.uploadedAt}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="inspectDocumentChunks(${index})" class="action-btn text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded hover:bg-indigo-500/40 transition">
          Vector Chunks (${doc.content.split(/[.!?]+/).filter(Boolean).length})
        </button>
        <button onclick="deleteDocument(${index})" class="text-xs text-rose-400 hover:text-rose-300 px-2 py-1">Delete</button>
      </div>
    `;
    list.appendChild(card);
  });
}

window.deleteDocument = function(index) {
  const docName = app.documents[index].name;
  app.documents.splice(index, 1);
  app.saveState();
  app.seedVectorEngine();
  renderDocuments();
  showToast(`Deleted document '${docName}' and cleared associated vector indices.`);
};

window.inspectDocumentChunks = function(index) {
  const doc = app.documents[index];
  const chunks = doc.content.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  
  const modal = document.getElementById("chunks-modal");
  const modalTitle = document.getElementById("modal-doc-title");
  const chunksList = document.getElementById("modal-chunks-list");

  modalTitle.textContent = doc.name;
  chunksList.innerHTML = "";
  
  chunks.forEach((chunk, cIdx) => {
    const li = document.createElement("li");
    li.className = "p-3 bg-slate-900 border border-gray-800 rounded text-xs text-gray-300 mb-2 flex flex-col gap-1.5";
    li.innerHTML = `
      <div class="flex justify-between items-center text-[10px] text-indigo-400 font-mono">
        <span>Chunk #${cIdx + 1}</span>
        <span>Embedding Vector Type: Knowledge (RAG Ready)</span>
      </div>
      <p class="italic text-gray-200">"${escapeHtml(chunk)}"</p>
      <div class="text-[9px] text-gray-500 font-mono mt-1 break-all bg-slate-950 p-1 rounded">
        <strong>Embedding Coordinates Sample:</strong> [0.1245, -0.0983, 0.4512, -0.7631, 0.0092 ... +379 float elements]
      </div>
    `;
    chunksList.appendChild(li);
  });

  modal.classList.remove("hidden");
};

window.closeChunksModal = function() {
  document.getElementById("chunks-modal").classList.add("hidden");
};

// Handle document file upload simulation
window.simulateFileUpload = function() {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".txt,.pdf,.doc,.docx";
  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const textContent = evt.target.result || `Simulated parsed PDF text content for ${file.name}. Lead Architect resume with 5 years React/Node stack.`;
      
      const newDoc = {
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        content: textContent
      };

      app.documents.push(newDoc);
      app.saveState();
      app.seedVectorEngine();
      renderDocuments();
      showToast(`Document '${file.name}' parsed & split into Knowledge Vectors!`);
    };

    if (file.type === "text/plain") {
      reader.readAsText(file);
    } else {
      // Simulate reading PDF text
      setTimeout(() => {
        reader.onload({ target: { result: `Parsed PDF resume record for ${file.name}. Candidate expertise in JavaScript, React, FastAPI, security configurations, and vector identity databases.` } });
      }, 500);
    }
  };
  fileInput.click();
};

// Render permissions
function renderPermissions() {
  const tableBody = document.getElementById("permissions-table-body");
  if (!tableBody) return;
  tableBody.innerHTML = "";

  app.permissions.forEach((perm, index) => {
    const tr = document.createElement("tr");
    tr.className = "border-b border-gray-800/80 hover:bg-slate-900/40 text-xs";
    tr.innerHTML = `
      <td class="py-3 px-4 font-semibold text-gray-300 font-mono">${escapeHtml(perm.domain)}</td>
      <td class="py-3 px-4 capitalize text-indigo-300">${perm.category.replace('_', ' ')}</td>
      <td class="py-3 px-4 text-gray-400 capitalize">
        <select onchange="updatePermissionType(${index}, this.value)" class="bg-slate-900 border border-gray-800 text-xs rounded p-1 text-gray-300">
          <option value="always_allow" ${perm.accessType === 'always_allow' ? 'selected' : ''}>Always Allow</option>
          <option value="ask_each_time" ${perm.accessType === 'ask_each_time' ? 'selected' : ''}>Ask Each Time</option>
          <option value="one_time" ${perm.accessType === 'one_time' ? 'selected' : ''}>One-Time Fill</option>
        </select>
      </td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 rounded-full text-[10px] bg-green-500/20 text-green-300 border border-green-500/30">
          ${perm.status}
        </span>
      </td>
      <td class="py-3 px-4">
        <button onclick="revokePermission(${index})" class="text-rose-400 hover:text-rose-300">Revoke</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

window.updatePermissionType = function(index, value) {
  app.permissions[index].accessType = value;
  app.saveState();
  showToast(`Permissions updated for ${app.permissions[index].domain}`);
};

window.revokePermission = function(index) {
  const domain = app.permissions[index].domain;
  app.permissions.splice(index, 1);
  app.saveState();
  renderPermissions();
  showToast(`Revoked all autofill permissions for '${domain}'.`);
};

// Render audit logs
function renderAuditLogs() {
  const container = document.getElementById("audit-logs-container");
  if (!container) return;
  container.innerHTML = "";

  app.auditLogs.forEach(log => {
    const div = document.createElement("div");
    div.className = "flex justify-between items-start border-b border-gray-800/80 py-3 text-xs";
    div.innerHTML = `
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="text-gray-500 font-mono text-[10px]">${log.time}</span>
          <span class="text-gray-300 font-semibold font-mono">${escapeHtml(log.domain)}</span>
        </div>
        <p class="text-gray-400 font-sans">${escapeHtml(log.action)} (${log.fields} fields checked)</p>
      </div>
      <div class="text-right">
        <span class="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono mr-2">
          Match: ${log.confidence}
        </span>
        <span class="text-green-400 font-semibold font-mono text-[10px]">${log.status}</span>
      </div>
    `;
    container.appendChild(div);
  });
}

// -------------------------------------------------------------
// 6. Interactive Playground Form Rendering
// -------------------------------------------------------------
function selectPlaygroundForm(formType) {
  app.activePlaygroundForm = formType;
  app.isAutofilled = false;
  
  // Highlight correct select button
  document.querySelectorAll(".form-selector-btn").forEach(btn => {
    if (btn.getAttribute("data-form") === formType) {
      btn.classList.add("bg-indigo-500/20", "border-indigo-500", "text-white");
      btn.classList.remove("border-gray-800", "text-gray-400");
    } else {
      btn.classList.remove("bg-indigo-500/20", "border-indigo-500", "text-white");
      btn.classList.add("border-gray-800", "text-gray-400");
    }
  });

  renderPlaygroundForm();
  updateExtensionOverlay();
}
window.selectPlaygroundForm = selectPlaygroundForm;

function renderPlaygroundForm() {
  const formBox = document.getElementById("simulated-web-form");
  if (!formBox) return;

  const formMeta = FORM_PLAYGROUND_TEMPLATES[app.activePlaygroundForm];
  
  let html = `
    <div class="flex justify-between items-center border-b border-gray-800/80 pb-4 mb-4">
      <div>
        <h4 class="text-md font-bold text-gray-200 font-sans flex items-center gap-2">
          🌐 ${formMeta.title}
        </h4>
        <p class="text-xs text-gray-500 mt-0.5">${formMeta.description}</p>
      </div>
      <div class="text-[10px] text-gray-500 font-mono bg-slate-950/60 border border-gray-900 px-2 py-1 rounded">
        DOM Frame: <span class="text-indigo-400">#document_iframe</span>
      </div>
    </div>
    <form id="playground-html-form" onsubmit="handlePlaygroundSubmit(event)" class="space-y-4">
  `;

  formMeta.fields.forEach(field => {
    html += `<div class="form-group flex flex-col relative" data-field-id="${field.id}">
      <label class="text-xs font-semibold text-gray-300 mb-1 flex items-center justify-between">
        <span>${field.label} ${field.required ? '<span class="text-rose-500">*</span>' : ''}</span>
        <span class="confidence-indicator text-[10px] hidden font-mono"></span>
      </label>`;

    if (field.type === "select") {
      html += `
        <select id="input_${field.id}" ${field.required ? 'required' : ''} 
                class="bg-slate-900 border border-gray-800 focus:border-indigo-500 rounded p-2 text-sm text-gray-200 focus:outline-none transition-all duration-300">
          <option value="" disabled selected>Select an option...</option>
          ${field.options.map(opt => `<option value="${escapeHtml(opt)}">${escapeHtml(opt)}</option>`).join('')}
        </select>
      `;
    } else if (field.type === "textarea") {
      html += `
        <textarea id="input_${field.id}" rows="3" placeholder="${field.placeholder}" ${field.required ? 'required' : ''} 
                  class="bg-slate-900 border border-gray-800 focus:border-indigo-500 rounded p-2 text-sm text-gray-200 focus:outline-none transition-all duration-300"></textarea>
      `;
    } else {
      html += `
        <input type="${field.type}" id="input_${field.id}" placeholder="${field.placeholder}" ${field.required ? 'required' : ''} 
               class="bg-slate-900 border border-gray-800 focus:border-indigo-500 rounded p-2 text-sm text-gray-200 focus:outline-none transition-all duration-300">
      `;
    }
    html += `</div>`;
  });

  html += `
      <div class="pt-4 border-t border-gray-800/80 flex gap-3">
        <button type="submit" class="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4 py-2 rounded transition shadow-lg shadow-indigo-900/20">
          Submit Form
        </button>
        <button type="button" onclick="clearPlaygroundForm()" class="border border-gray-800 text-gray-400 hover:text-gray-200 text-sm px-4 py-2 rounded transition">
          Reset Fields
        </button>
      </div>
    </form>
  `;

  formBox.innerHTML = html;
}

window.clearPlaygroundForm = function() {
  const formMeta = FORM_PLAYGROUND_TEMPLATES[app.activePlaygroundForm];
  formMeta.fields.forEach(field => {
    const input = document.getElementById(`input_${field.id}`);
    if (input) input.value = "";
    
    // Hide confidence labels
    const grp = document.querySelector(`.form-group[data-field-id="${field.id}"]`);
    if (grp) {
      const ind = grp.querySelector('.confidence-indicator');
      if (ind) ind.classList.add('hidden');
      input.classList.remove('border-green-500/50', 'bg-green-950/10', 'border-indigo-500/50', 'bg-indigo-950/10');
      input.classList.add('border-gray-800');
    }
  });
  app.isAutofilled = false;
  updateExtensionOverlay();
};

window.handlePlaygroundSubmit = function(e) {
  e.preventDefault();
  
  // Record audit log entry
  const domainMap = {
    job: "greenhouse.io",
    onboarding: "saas-workspace.com/onboard",
    ecommerce: "shopify.com/checkout"
  };

  const formMeta = FORM_PLAYGROUND_TEMPLATES[app.activePlaygroundForm];
  const domain = domainMap[app.activePlaygroundForm];
  const fieldCount = formMeta.fields.length;
  
  const newLog = {
    time: new Date().toTimeString().split(' ')[0],
    domain: domain,
    action: app.isAutofilled ? "Form Auto-filled & Submitted" : "Manual Fill & Submitted",
    status: "Success",
    confidence: app.isAutofilled ? "95%" : "100%",
    fields: fieldCount
  };

  app.auditLogs.unshift(newLog);
  app.saveState();
  renderAuditLogs();

  // Create a stunning popup notification
  showToast(`🚀 Form successfully submitted! Data mapped to audit trail.`, 4000);
  clearPlaygroundForm();
};

// -------------------------------------------------------------
// 7. Floating Extension Simulator Logic
// -------------------------------------------------------------
function toggleFloatingExtension() {
  app.showFloatingPanel = !app.showFloatingPanel;
  const overlay = document.getElementById("autoflow-extension-floating-overlay");
  if (!overlay) return;

  if (app.showFloatingPanel) {
    overlay.classList.remove("translate-x-full");
  } else {
    overlay.classList.add("translate-x-full");
  }
}
window.toggleFloatingExtension = toggleFloatingExtension;

// Scan page DOM (simulated) and display predictions in floating panel
function updateExtensionOverlay() {
  const overlayContent = document.getElementById("extension-overlay-content");
  if (!overlayContent) return;

  if (app.activeExtensionTab === "inspect") {
    renderInspectorView(overlayContent);
    return;
  }

  const formMeta = FORM_PLAYGROUND_TEMPLATES[app.activePlaygroundForm];
  const fieldsMatches = app.scanFormFields(formMeta.fields);

  // Filter out any domains not in permissions to check matching permission policy
  const matchedDomain = app.permissions.find(p => p.domain.includes(app.activePlaygroundForm === 'job' ? 'greenhouse' : app.activePlaygroundForm === 'onboarding' ? 'workday' : 'stripe'));
  const permissionPolicy = matchedDomain ? matchedDomain.accessType : 'ask_each_time';

  let html = `
    <div class="mb-4 bg-slate-900/80 border border-gray-800 rounded p-3 text-xs">
      <div class="flex justify-between items-center mb-2">
        <span class="font-bold text-gray-300">Detected Form Fields:</span>
        <span class="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold">${fieldsMatches.length} Found</span>
      </div>
      <p class="text-gray-500 text-[10px] leading-relaxed">
        AutoFlow parsed DOM and matched with user vector spaces. Decrypted data is loaded securely in context memory.
      </p>
      <div class="mt-2.5 flex items-center justify-between border-t border-gray-800/80 pt-2 text-[10px] text-gray-400 font-mono">
        <span>Policy: <strong class="text-indigo-400 uppercase">${permissionPolicy.replace('_', ' ')}</strong></span>
        <span>Encrypted Cache: <strong class="text-green-400 font-sans">Active</strong></span>
      </div>
    </div>
    
    <div class="space-y-2.5 max-h-72 overflow-y-auto pr-1">
  `;

  fieldsMatches.forEach(match => {
    const isMatched = match.score > 0.15;
    const scorePct = Math.round(match.score * 100);
    
    let scoreColor = "text-rose-400 bg-rose-500/10 border-rose-500/20";
    if (scorePct >= 80) scoreColor = "text-green-400 bg-green-500/10 border-green-500/20";
    else if (scorePct >= 50) scoreColor = "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";

    html += `
      <div class="field-match-item border border-gray-800 bg-slate-950/80 rounded p-2.5 flex flex-col gap-1.5">
        <div class="flex justify-between items-center">
          <span class="text-xs font-semibold text-gray-300">${match.fieldLabel}</span>
          ${isMatched 
            ? `<span class="px-1.5 py-0.5 rounded border text-[9px] font-mono font-semibold ${scoreColor}">${scorePct}% Confidence</span>` 
            : `<span class="px-1.5 py-0.5 rounded border text-[9px] font-mono text-gray-500 bg-gray-900 border-gray-800">No Vector Match</span>`
          }
        </div>
        <div class="flex items-center justify-between gap-2 mt-0.5">
          <span class="text-[10px] text-gray-500 truncate font-mono max-w-[150px]">
            ${isMatched ? `→ ${escapeHtml(match.suggestedValue)}` : `<em>Leave blank / manual</em>`}
          </span>
          <span class="text-[9px] text-indigo-400 bg-indigo-500/10 px-1 rounded capitalize font-mono">
            ${match.category}
          </span>
        </div>
        ${isMatched ? `
          <div class="text-[8px] text-gray-600 flex justify-between font-mono border-t border-gray-900 pt-1">
            <span>Source: ${match.sourceType.toUpperCase()} Vault</span>
            <span>Ref: ${match.sourceDoc}</span>
          </div>
        ` : ''}
      </div>
    `;
  });

  html += `</div>`;

  // Control fill triggers based on current auto-fill status
  if (app.isAutofilled) {
    html += `
      <div class="mt-4 pt-3 border-t border-gray-800/80 flex gap-2">
        <button onclick="clearPlaygroundForm()" class="flex-1 bg-rose-950/40 hover:bg-rose-900/30 text-rose-300 font-bold text-xs py-2 rounded text-center transition border border-rose-900/30">
          Clear Filled Values
        </button>
      </div>
    `;
  } else {
    html += `
      <div class="mt-4 pt-3 border-t border-gray-800/80 flex gap-2">
        <button onclick="triggerAutoFillSimulation()" class="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs py-2 rounded text-center transition shadow-lg shadow-indigo-950/30">
          ⚡ Auto-Fill via Context Vector
        </button>
      </div>
    `;
  }

  overlayContent.innerHTML = html;
}

// Render dynamic vector similarity inspector tab
function renderInspectorView(container) {
  const formMeta = FORM_PLAYGROUND_TEMPLATES[app.activePlaygroundForm];
  const fields = formMeta.fields;
  
  if (!app.selectedInspectorField || !fields.find(f => f.id === app.selectedInspectorField)) {
    app.selectedInspectorField = fields[0]?.id || "";
  }
  
  const currentField = fields.find(f => f.id === app.selectedInspectorField);
  if (!currentField) {
    container.innerHTML = `<p class="text-xs text-gray-500">No fields available to inspect.</p>`;
    return;
  }
  
  // Extract query info and matches
  const queryStr = `${currentField.id} ${currentField.label} ${currentField.placeholder || ''}`;
  const queryTokens = app.ragEngine.tokenize(queryStr);
  const matches = app.ragEngine.getDetailedSimilarityMatches(queryStr).slice(0, 3);
  
  let html = `
    <div class="mb-4 bg-slate-900/80 border border-gray-800 rounded p-3 text-xs">
      <div class="flex justify-between items-center mb-2.5">
        <label class="text-xs font-bold text-gray-300">Target Field:</label>
        <select onchange="changeInspectorField(this.value)" class="bg-slate-950 border border-gray-800 text-[11px] rounded p-1 text-indigo-300 font-semibold focus:outline-none">
          ${fields.map(f => `<option value="${f.id}" ${f.id === app.selectedInspectorField ? 'selected' : ''}>${f.label}</option>`).join('')}
        </select>
      </div>
      
      <div class="mt-2.5 border-t border-gray-800/80 pt-2.5">
        <span class="text-[10px] text-gray-500 font-mono">EXTRACTED QUERY STR:</span>
        <div class="text-xs font-mono text-gray-300 bg-slate-950 p-1.5 rounded border border-gray-900 mt-1 truncate" title="${escapeHtml(queryStr)}">
          "${escapeHtml(queryStr)}"
        </div>
      </div>
      
      <div class="mt-2 pt-2">
        <span class="text-[10px] text-gray-500 font-mono">TOKENIZED KEYS:</span>
        <div class="token-capsules-container mt-1">
          ${queryTokens.length > 0 
            ? queryTokens.map(t => `<span class="token-capsule">${escapeHtml(t)}</span>`).join('') 
            : `<span class="text-[10px] text-gray-600 italic">None</span>`
          }
        </div>
      </div>
    </div>
    
    <div class="space-y-3 mb-4">
      <span class="text-[10px] text-gray-500 font-mono block">COSINE SIMILARITY RADAR:</span>
      ${matches.length > 0 ? matches.map((match, idx) => {
        const scorePct = Math.round(match.score * 100);
        let categoryClass = "low";
        if (scorePct >= 80) categoryClass = "high";
        else if (scorePct >= 50) categoryClass = "medium";
        
        return `
          <div class="glass-card p-3 border border-gray-900 bg-slate-950/40 relative">
            <div class="flex justify-between items-start mb-1.5">
              <div>
                <span class="text-xs font-semibold text-gray-200">${escapeHtml(match.item.label)}</span>
                <span class="text-[8px] font-mono text-gray-500 ml-1.5 capitalize">(${match.item.category})</span>
              </div>
              <span class="text-[10px] font-mono font-bold ${scorePct >= 80 ? 'text-green-400' : scorePct >= 50 ? 'text-yellow-400' : 'text-rose-400'}">
                ${scorePct}% Cos-Sim
              </span>
            </div>
            <div class="text-[10px] text-gray-400 truncate mb-1">
              Value: <strong class="text-gray-300 font-mono">${escapeHtml(match.item.value)}</strong>
            </div>
            <div class="similarity-bar-container">
              <div class="similarity-bar-fill ${categoryClass}" style="width: ${scorePct}%"></div>
            </div>
            <div class="text-[8px] text-gray-600 font-mono mt-1.5 flex justify-between">
              <span>Matched: ${match.tokensMatched.length > 0 ? escapeHtml(match.tokensMatched.join(', ')) : 'None'}</span>
              <span>Ref ID: ${match.item.id}</span>
            </div>
          </div>
        `;
      }).join('') : `<p class="text-xs text-gray-500 italic">No matches found above threshold.</p>`}
    </div>
    
    <!-- Calibration Widget -->
    <div class="bg-slate-900/80 border border-gray-800 rounded p-3 text-xs">
      <div class="flex justify-between items-center mb-1">
        <span class="font-bold text-gray-300">Vector Calibration & Synonym Alignment</span>
        <span class="text-[9px] text-violet-400 font-mono">Embed Context</span>
      </div>
      <p class="text-gray-500 text-[10px] leading-relaxed mb-2.5">
        Associate new search synonyms with the best match vault item (${matches[0] ? escapeHtml(matches[0].item.label) : 'None'}) to auto-align.
      </p>
      
      <div class="inspector-input-group">
        <input type="text" id="synonym-input" placeholder="e.g. work-mailbox, resume-link" 
               class="inspector-input" onkeydown="if(event.key==='Enter') executeVectorCalibration()">
        <button onclick="executeVectorCalibration()" class="inspector-btn">Align</button>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}

// Global scope helpers for Inspector tab
window.setExtensionTab = function(tab) {
  app.activeExtensionTab = tab;
  
  const fillBtn = document.getElementById("ext-tab-btn-fill");
  const inspectBtn = document.getElementById("ext-tab-btn-inspect");
  
  if (tab === "fill") {
    fillBtn?.classList.add("active");
    fillBtn?.classList.add("bg-indigo-500/20", "text-indigo-300", "border-indigo-500/30");
    fillBtn?.classList.remove("border-gray-800", "text-gray-500");
    
    inspectBtn?.classList.remove("active");
    inspectBtn?.classList.remove("bg-indigo-500/20", "text-indigo-300", "border-indigo-500/30");
    inspectBtn?.classList.add("border-gray-800", "text-gray-500");
  } else {
    inspectBtn?.classList.add("active");
    inspectBtn?.classList.add("bg-indigo-500/20", "text-indigo-300", "border-indigo-500/30");
    inspectBtn?.classList.remove("border-gray-800", "text-gray-500");
    
    fillBtn?.classList.remove("active");
    fillBtn?.classList.remove("bg-indigo-500/20", "text-indigo-300", "border-indigo-500/30");
    fillBtn?.classList.add("border-gray-800", "text-gray-500");
  }
  
  updateExtensionOverlay();
};

window.changeInspectorField = function(fieldId) {
  app.selectedInspectorField = fieldId;
  updateExtensionOverlay();
};

window.executeVectorCalibration = function() {
  const input = document.getElementById("synonym-input");
  if (!input || !input.value.trim()) {
    showToast("Please enter a valid synonym keyword.");
    return;
  }
  
  const formMeta = FORM_PLAYGROUND_TEMPLATES[app.activePlaygroundForm];
  const currentField = formMeta.fields.find(f => f.id === app.selectedInspectorField);
  if (!currentField) return;
  
  const queryStr = `${currentField.id} ${currentField.label} ${currentField.placeholder || ''}`;
  const matches = app.ragEngine.getDetailedSimilarityMatches(queryStr).slice(0, 1);
  
  if (matches.length === 0) {
    showToast("No target vector found to calibrate.");
    return;
  }
  
  const bestMatch = matches[0].item;
  const synonymText = input.value.trim();
  
  app.addVectorSynonym(bestMatch.id, synonymText);
  input.value = "";
  
  showToast(`Calibrated! Bound synonym '${synonymText}' to '${bestMatch.label}' vector vault field.`, 3500);
  updateExtensionOverlay();
};

// Simulates the native-like typing events & visual green glows
window.triggerAutoFillSimulation = function() {
  const formMeta = FORM_PLAYGROUND_TEMPLATES[app.activePlaygroundForm];
  const fieldsMatches = app.scanFormFields(formMeta.fields);

  fieldsMatches.forEach((match, idx) => {
    const input = document.getElementById(`input_${match.fieldId}`);
    if (!input) return;

    const grp = document.querySelector(`.form-group[data-field-id="${match.fieldId}"]`);
    const isMatched = match.score > 0.15;
    const scorePct = Math.round(match.score * 100);

    // Apply incremental typing animation for visual premium experience
    setTimeout(() => {
      if (isMatched) {
        let currentText = "";
        const targetText = match.suggestedValue;
        
        // Style changes indicating AI intervention
        input.classList.remove('border-gray-800');
        input.classList.add('border-indigo-500/50', 'bg-indigo-950/10');
        
        const indicator = grp.querySelector('.confidence-indicator');
        if (indicator) {
          indicator.textContent = `${scorePct}% RAG Match`;
          indicator.className = `confidence-indicator text-[10px] font-mono ${scorePct >= 80 ? 'text-green-400' : 'text-yellow-400'}`;
          indicator.classList.remove('hidden');
        }

        // Typing simulator
        if (input.tagName === "SELECT") {
          input.value = targetText;
          // Trigger change event
          input.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          let charIndex = 0;
          const typingTimer = setInterval(() => {
            if (charIndex < targetText.length) {
              currentText += targetText[charIndex];
              input.value = currentText;
              charIndex++;
              // Trigger input event
              input.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
              clearInterval(typingTimer);
              // Fade from indigo glow to green success indicator
              input.classList.remove('border-indigo-500/50', 'bg-indigo-950/10');
              input.classList.add('border-green-500/50', 'bg-green-950/10');
            }
          }, 15);
        }
      }
    }, idx * 100); // Stagger input fills by 100ms
  });

  app.isAutofilled = true;
  
  // Show toast notification
  setTimeout(() => {
    updateExtensionOverlay();
    showToast("✨ Auto-fill complete! Values populated successfully.", 3000);
  }, fieldsMatches.length * 100 + 400);
};

// -------------------------------------------------------------
// 8. Technology Documentation Portal
// -------------------------------------------------------------
function renderTechDocs() {
  const container = document.getElementById("tech-docs-container");
  if (!container) return;

  const docs = [
    {
      title: "Universal Vector Engine (RAG Workflow)",
      desc: "Converts user profiles and uploaded assets into 384-dimensional floating point vectors via embeddings. During auto-fill triggers, HTML labels, tags, and structure are matched using local TF-IDF & Cosine Similarity search against personal user vector stores.",
      code: `// Python / pgvector RAG Matching Loop
async def find_identity_matches(user_id: UUID, form_fields: List[FieldSchema]):
    matches = []
    for field in form_fields:
        query_text = f"{field.id} {field.label} {field.placeholder}"
        embedding = await get_embeddings(query_text)
        
        # Execute PostgreSQL Cosine Similarity vector search
        result = db.execute(
            "SELECT content_chunk, key, value, (embedding <=> :emb) as distance "
            "FROM user_vectors WHERE user_id = :uid ORDER BY distance LIMIT 1",
            {"emb": embedding, "uid": user_id}
        ).fetchone()
        
        if result and result.distance < 0.25: # Confidence threshold
            matches.append(MatchResult(field_id=field.id, value=result.value, score=1 - result.distance))
    return matches`
    },
    {
      title: "Zero-Knowledge Encryption Flow",
      desc: "All personal fields are encrypted client-side using WebCrypto PBKDF2-derived keys. The cloud database only stores the vector coordinate index for fast search and the encrypted payloads. Absolute user privacy guarantees that the platform operator cannot view raw credentials.",
      code: `// Client-side WebCrypto AES-GCM Encrypt Schema
async function encryptProfileValue(value, masterKey) {
    const encoder = new TextEncoder();
    const encodedValue = encoder.encode(value);
    
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw", encoder.encode(masterKey), "PBKDF2", false, ["deriveKey"]
    );
    const key = await window.crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
        keyMaterial, { name: "AES-GCM", length: 256 }, false, ["encrypt"]
    );
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv }, key, encodedValue
    );
    
    return {
        ciphertext: bufToHex(ciphertext),
        iv: bufToHex(iv),
        salt: bufToHex(salt)
    };
}`
    },
    {
      title: "Permissions Policy Guard",
      desc: "Enforces continuous permissions. Domain policies (Always Allow, Ask Each Time, One-Time Access, Expiring Session) evaluate matching prompts before transmitting any decrypted strings from content scripts to target DOM variables.",
      code: `// Content Script Permission Handlers
async function evaluateFillPolicy(domain, category) {
    const policy = await chrome.runtime.sendMessage({
        action: "CHECK_PERMISSION", domain, category
    });
    
    if (policy.access === "always_allow") return true;
    if (policy.access === "one_time" && policy.active_session) return true;
    
    // Inject floating confirmation dialog to prompt user
    const userConsent = await injectPromptOverlay(domain, category);
    return userConsent;
}`
    }
  ];

  let html = `<div class="space-y-6">`;
  docs.forEach(doc => {
    html += `
      <div class="glass-card p-6 border-t-2 border-indigo-500/50">
        <h4 class="text-sm font-bold text-indigo-400 mb-2 font-mono flex items-center gap-2">
          ⚡ ${doc.title}
        </h4>
        <p class="text-xs text-gray-400 mb-4 leading-relaxed">${doc.desc}</p>
        <pre class="bg-slate-950 p-4 rounded border border-gray-800 text-[10px] text-gray-300 overflow-x-auto font-mono max-h-60"><code>${escapeHtml(doc.code)}</code></pre>
      </div>
    `;
  });
  html += `</div>`;

  container.innerHTML = html;
}

// -------------------------------------------------------------
// 9. Toast Notification System
// -------------------------------------------------------------
function showToast(message, duration = 3000) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast-message glass-card border border-indigo-500/30 text-xs px-4 py-3 text-gray-200 flex items-center gap-2.5 shadow-xl transition-all duration-300 opacity-0 translate-y-3";
  toast.innerHTML = `
    <span class="text-indigo-400">🔥</span>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.classList.remove("opacity-0", "translate-y-3");
  }, 10);

  // Remove toast
  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-[-3px]");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}

// Helper to escape HTML tags to avoid XSS in dynamic rendering
function escapeHtml(str) {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
