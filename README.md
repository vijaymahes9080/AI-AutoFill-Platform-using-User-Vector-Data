# AutoFlow AI — Universal Intelligent Auto-Fill Ecosystem

AutoFlow AI is a next-generation personal data operating layer that automatically reads, remembers, and fills user details across web forms, apps, and dashboards. Using **vectorized user profiles** instead of fragile static autofill forms, it matches target field scopes with RAG query context while maintaining client-side zero-knowledge encryption guarantees.

---

## 🚀 Key Features

* **Universal Vector Vault**: Stores dynamic context, education records, work portfolios, and personal metadata in a vector index structure.
* **On-Device Vector RAG Engine**: Computes token matching locally using Cosine Similarity metrics between form descriptors (IDs, placeholders, labels) and profile vectors.
* **Zero-Knowledge Architecture**: Simulates end-to-end client encryption using PBKDF2 key derivation and AES-GCM-256 visual outputs, keeping raw credentials invisible to the cloud layer.
* **Form Playground & Extension Simulator**: Contains multi-step forms (ATS Job Application, SaaS Workspace Onboarding, Shopify checkout) alongside a simulated floating chrome extension panel.
* **Smart Permission Gating**: Enforces domain-level consent policies (Always Allow, Ask Each Time, One-Time Session token).

---

## 🛠️ Project Structure

The project consists of three core components:

* **[index.html](file:///d:/current project/AI AutoFill Platform using User Vector Data/index.html)**: The single-page application dashboard housing the UI, simulated forms, extension overlay, permissions tables, and architecture schemas.
* **[style.css](file:///d:/current project/AI AutoFill Platform using User Vector Data/style.css)**: Custom glassmorphic styling system using HSL neons (Electric Indigo, Tech Violet, Neon Teal), glowing input states, typing animations, and layouts.
* **[app.js](file:///d:/current project/AI AutoFill Platform using User Vector Data/app.js)**: The core JavaScript application layer including the `VectorRAGEngine` class, `CryptoSimulator`, state sync configurations, form templates, and UI triggers.

---

## ⚡ Core Engine Logic: Vector RAG Matching

The platform replaces simple keyword matching with a local TF-IDF vector space:

1. **Vector Ingestion**:
   Inputs, documents, and manual vault entries are tokenized (ignoring stopwords) and stored as term-frequency vectors inside the client memory space.
2. **DOM Field Scanning**:
   When the extension scans a target web page, it constructs search queries by aggregating the element ID, input label, and placeholder text.
3. **Similarity Search**:
   The engine computes the cosine similarity between the query and all vault chunks:
   $$\text{Similarity} = \frac{A \cdot B}{\|A\| \|B\|}$$
   Values scoring above a certain threshold (e.g. `0.15`) are suggested as candidate values.
4. **Natural Event Injection**:
   Instead of updating element attributes directly (which triggers anti-bot blocking), the engine dispatches synthetic `input` and `change` events sequentially to emulate keystrokes.

---

## ⚙️ How to Run Locally

### 1. Prerequisite
Ensure you have [Node.js](https://nodejs.org/) installed to run the local server.

### 2. Install Dev Server & Launch
Run the following script command in your terminal from the project directory:

```bash
# Start the local development server
npm run dev
```

This commands spins up a lightweight server at:
**`http://localhost:8080`**

Open the link in your browser to view the interactive dashboard.

---

## 🛡️ Security Model

* **Client-Side Encryption**: Field values are converted to ciphertexts using keys derived on-device from the user's master password.
* **Local Embeddings**: The semantic matching loop runs entirely in local memory (via local vector representations), keeping profile metrics isolated from public models.
* **Audit Trail logs**: Logs all auto-fill attempts, domain patterns, field counts, and confidence scores locally for continuous user review.
