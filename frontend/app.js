(function () {
  "use strict";

  async function sha256Hex(file) {
    const buffer = await file.arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  function isoNow() {
    return new Date().toISOString().replace(/\.\d+Z$/, "Z");
  }

  function humanTime(value) {
    const d = new Date(value);
    return d.toISOString().slice(0, 19).replace("T", " ") + " UTC";
  }

  function randomAnchorId() {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function download(filename, text) {
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const config = window.ProofDropConfig || {};
  const SEPOLIA_CHAIN_ID = config.sepoliaChainId || "0xaa36a7";

  let walletProvider = null;
  let walletSigner = null;
  let walletAddress = "";

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function shortAddress(address) {
    return address.slice(0, 6) + "..." + address.slice(-4);
  }

  function fileHashToBytes32(hash) {
    return hash.startsWith("0x") ? hash : "0x" + hash;
  }

  function getContractAddress() {
    return config.contractAddress || "";
  }

  function setWalletStatus(message, kind) {
    document.querySelectorAll("#walletStatus").forEach((el) => {
      el.textContent = message;
      el.dataset.status = kind || "info";
    });
  }

  function updateWalletButtons() {
    document.querySelectorAll("#connectWalletBtn").forEach((button) => {
      button.textContent = walletAddress ? "Disconnect wallet" : "Connect wallet";
      button.dataset.connected = walletAddress ? "true" : "false";
    });
  }

  async function requestAccountSelection() {
    await window.ethereum.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }],
    });
  }

  async function revokeWalletPermission() {
    try {
      await window.ethereum.request({
        method: "wallet_revokePermissions",
        params: [{ eth_accounts: {} }],
      });
    } catch {
      /* Some wallets do not support programmatic permission revocation. */
    }
  }

  async function disconnectWallet(revokePermission) {
    if (revokePermission && window.ethereum) {
      await revokeWalletPermission();
    }
    walletProvider = null;
    walletSigner = null;
    walletAddress = "";
    setWalletStatus(
      revokePermission
        ? "Wallet disconnected. Connect again to choose an account."
        : "Wallet disconnected in ProofDrop.",
      "info"
    );
    updateWalletButtons();
  }

  function setButtonBusy(button, label) {
    const original = button.textContent;
    button.disabled = true;
    button.innerHTML =
      '<span class="spinner" style="color:currentColor;"></span> ' + label;
    return () => {
      button.disabled = false;
      button.textContent = original;
      updateWalletButtons();
    };
  }

  async function ensureSepolia() {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed.");
    }

    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (chainId === SEPOLIA_CHAIN_ID) return;

    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    });
  }

  async function connectWallet() {
    if (!window.ethereum || !window.ethers) {
      throw new Error("MetaMask and ethers.js are required.");
    }

    await ensureSepolia();
    await requestAccountSelection();
    walletProvider = new window.ethers.BrowserProvider(window.ethereum);
    walletSigner = await walletProvider.getSigner();
    walletAddress = await walletSigner.getAddress();
    setWalletStatus(
      "Connected to Sepolia as " + shortAddress(walletAddress),
      "success"
    );
    updateWalletButtons();
    return walletSigner;
  }

  async function getWritableContract() {
    if (!getContractAddress()) {
      throw new Error("Contract address is not configured yet.");
    }
    if (!walletSigner) {
      await connectWallet();
    }
    return new window.ethers.Contract(
      getContractAddress(),
      config.abi,
      walletSigner
    );
  }

  async function getReadableContract() {
    if (!getContractAddress()) {
      throw new Error("Contract address is not configured yet.");
    }
    if (!walletProvider) {
      await connectWallet();
    }
    return new window.ethers.Contract(
      getContractAddress(),
      config.abi,
      walletProvider
    );
  }

  function initWalletControls() {
    const buttons = document.querySelectorAll("#connectWalletBtn");
    if (!buttons.length) return;

    if (!window.ethereum) {
      setWalletStatus("MetaMask was not detected in this browser.", "error");
    } else if (!getContractAddress()) {
      setWalletStatus(
        "MetaMask ready. Contract address will be added after deployment.",
        "info"
      );
    }

    updateWalletButtons();

    buttons.forEach((button) => {
      button.addEventListener("click", async () => {
        if (walletAddress) {
          const restore = setButtonBusy(button, "Disconnecting...");
          try {
            await disconnectWallet(true);
          } finally {
            restore();
          }
          return;
        }

        const restore = setButtonBusy(button, "Connecting...");
        try {
          await connectWallet();
        } catch (error) {
          setWalletStatus(error.message, "error");
        } finally {
          restore();
        }
      });
    });

    if (window.ethereum && window.ethereum.on) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (!accounts.length) {
          disconnectWallet(false);
          return;
        }
        walletAddress = accounts[0];
        setWalletStatus(
          "Connected to Sepolia as " + shortAddress(walletAddress),
          "success"
        );
        updateWalletButtons();
      });

      window.ethereum.on("chainChanged", () => {
        disconnectWallet(false);
        setWalletStatus("Network changed. Reconnect on Sepolia.", "info");
      });
    }
  }

  function wireDropzone(zone, input, onFile) {
    if (!zone || !input) return;

    zone.addEventListener("click", () => input.click());
    zone.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        input.click();
      }
    });

    ["dragenter", "dragover"].forEach((evt) =>
      zone.addEventListener(evt, (e) => {
        e.preventDefault();
        zone.classList.add("dragover");
      })
    );

    ["dragleave", "drop"].forEach((evt) =>
      zone.addEventListener(evt, (e) => {
        e.preventDefault();
        zone.classList.remove("dragover");
      })
    );

    zone.addEventListener("drop", (e) => {
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) onFile(file);
    });

    input.addEventListener("change", () => {
      const file = input.files && input.files[0];
      if (file) onFile(file);
    });
  }

  function initSealFlow() {
    const zone = document.getElementById("sealDropzone");
    const input = document.getElementById("sealFileInput");
    const zoneText = document.getElementById("sealDropzoneText");
    const card = document.getElementById("sealRecordCard");
    if (!zone || !input || !card) return;

    const fieldFile = document.getElementById("sealFieldFile");
    const fieldFingerprint = document.getElementById("sealFieldFingerprint");
    const fieldSealedAt = document.getElementById("sealFieldSealedAt");
    const fieldAnchor = document.getElementById("sealFieldAnchor");
    const fieldStatus = document.getElementById("sealFieldStatus");
    const actions = document.getElementById("sealActions");
    const copyBtn = document.getElementById("copyFingerprintBtn");
    const downloadBtn = document.getElementById("downloadProofBtn");
    const sealOnChainBtn = document.getElementById("sealOnChainBtn");

    let current = null;

    function setStatus(status, label) {
      fieldStatus.innerHTML =
        '<span class="status-pill" data-status="' +
        status +
        '"><span class="dot"></span>' +
        label +
        "</span>";
    }

    async function handleFile(file) {
      current = null;
      actions.hidden = true;
      card.dataset.state = "hashing";
      zone.classList.remove("has-file");
      zoneText.innerHTML =
        'Reading <span class="dz-filename">' + escapeHtml(file.name) + "</span>";

      fieldFile.textContent = file.name;
      fieldFingerprint.textContent = "-";
      fieldSealedAt.textContent = "-";
      fieldAnchor.textContent = "-";
      setStatus("hashing", "Hashing file locally...");

      const hash = await sha256Hex(file);
      await wait(prefersReducedMotion ? 0 : 450);

      setStatus("pending", "Creating local proof record...");
      fieldFingerprint.textContent = hash;
      const sealedAt = isoNow();
      fieldSealedAt.textContent = humanTime(sealedAt);
      fieldAnchor.textContent = "Preparing local preview...";

      await wait(prefersReducedMotion ? 0 : 700);

      const anchorId = randomAnchorId();
      const anchorLabel = "Local preview - " + anchorId;
      fieldAnchor.textContent = anchorLabel;
      setStatus("sealed", "Sealed - verified locally");
      card.dataset.state = "sealed";
      zoneText.innerHTML =
        'Sealed <span class="dz-filename">' +
        escapeHtml(file.name) +
        "</span> - drop another file to seal it";
      zone.classList.add("has-file");

      current = {
        file: file.name,
        size: file.size,
        algorithm: "SHA-256",
        fingerprint: hash,
        sealedAt,
        anchor: anchorLabel,
        status: "sealed",
        note: "This proof record was created in the ProofDrop local browser preview. Blockchain anchoring is not connected yet.",
      };
      actions.hidden = false;
    }

    wireDropzone(zone, input, (file) => {
      handleFile(file).catch(() => {
        setStatus("error", "Something went wrong reading that file - try again.");
      });
    });

    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        if (!current) return;
        try {
          await navigator.clipboard.writeText(current.fingerprint);
          const original = copyBtn.textContent;
          copyBtn.textContent = "Copied";
          setTimeout(() => (copyBtn.textContent = original), 1400);
        } catch {
          /* Clipboard can be blocked on local files; the fingerprint remains visible. */
        }
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => {
        if (!current) return;
        const name = current.file.replace(/\.[^/.]+$/, "") + ".proofdrop.json";
        download(name, JSON.stringify(current, null, 2));
      });
    }

    if (sealOnChainBtn) {
      sealOnChainBtn.addEventListener("click", async () => {
        if (!current) return;
        const restore = setButtonBusy(sealOnChainBtn, "Sealing...");
        try {
          const contract = await getWritableContract();
          const tx = await contract.sealFile(fileHashToBytes32(current.fingerprint));
          setStatus("pending", "Waiting for Sepolia confirmation...");
          fieldAnchor.textContent = tx.hash;
          const receipt = await tx.wait();

          current.anchor = "Sepolia transaction - " + receipt.hash;
          current.transactionHash = receipt.hash;
          current.chain = "sepolia";
          current.contractAddress = getContractAddress();
          fieldAnchor.textContent = current.anchor;
          setStatus("sealed", "Sealed on Sepolia");
        } catch (error) {
          setStatus("error", error.reason || error.message || "On-chain seal failed.");
        } finally {
          restore();
        }
      });
    }
  }

  function initVerifyFlow() {
    const checkBtn = document.getElementById("verifyCheckBtn");
    if (!checkBtn) return;

    const fileZone = document.getElementById("verifyFileDropzone");
    const fileInput = document.getElementById("verifyFileInput");
    const fileZoneText = document.getElementById("verifyFileDropzoneText");

    const proofZone = document.getElementById("verifyProofDropzone");
    const proofInput = document.getElementById("verifyProofInput");
    const proofZoneText = document.getElementById("verifyProofDropzoneText");

    const liveResult = document.getElementById("liveResult");
    const liveResultCard = document.getElementById("liveResultCard");
    const validationMsg = document.getElementById("verifyValidationMsg");
    const verifyOnChainBtn = document.getElementById("verifyOnChainBtn");

    let chosenFile = null;
    let chosenProof = null;

    wireDropzone(fileZone, fileInput, (file) => {
      chosenFile = file;
      fileZoneText.innerHTML =
        'Selected <span class="dz-filename">' + escapeHtml(file.name) + "</span>";
      fileZone.classList.add("has-file");
    });

    wireDropzone(proofZone, proofInput, (file) => {
      const reader = new FileReader();
      reader.onload = () => {
        chosenProof = reader.result;
        proofZoneText.innerHTML =
          'Selected <span class="dz-filename">' + escapeHtml(file.name) + "</span>";
        proofZone.classList.add("has-file");
      };
      reader.readAsText(file);
    });

    function renderResult(html, mismatch) {
      liveResult.hidden = false;
      liveResultCard.className = "result-card" + (mismatch ? " mismatch" : "");
      liveResultCard.innerHTML = html;
      liveResult.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    }

    checkBtn.addEventListener("click", async () => {
      if (validationMsg) validationMsg.hidden = true;

      if (!chosenFile || !chosenProof) {
        if (validationMsg) {
          validationMsg.hidden = false;
          validationMsg.textContent = "Choose both a file and a proof record first.";
        }
        return;
      }

      let record;
      try {
        record = JSON.parse(chosenProof);
        if (!record.fingerprint) throw new Error("missing fingerprint");
      } catch {
        renderResult(
          '<p class="result-status"><span class="status-pill" data-status="error"><span class="dot"></span>Could not read that proof record</span></p>' +
            '<div class="rline"><span class="rk">REASON</span><span class="rv">File is not a valid ProofDrop proof record (JSON with a fingerprint field)</span></div>',
          true
        );
        return;
      }

      const restore = setButtonBusy(checkBtn, "Checking...");
      const hash = await sha256Hex(chosenFile);
      restore();

      if (hash === record.fingerprint) {
        renderResult(
          '<p class="result-status"><span class="status-pill" data-status="sealed"><span class="dot"></span>Verified - file matches seal</span></p>' +
            '<div class="rline"><span class="rk">FILE</span><span class="rv">' +
            escapeHtml(record.file || chosenFile.name) +
            '</span></div>' +
            '<div class="rline"><span class="rk">FINGERPRINT</span><span class="rv">' +
            hash +
            '</span></div>' +
            '<div class="rline"><span class="rk">SEALED AT</span><span class="rv">' +
            escapeHtml(record.sealedAt ? humanTime(record.sealedAt) : "-") +
            '</span></div>' +
            '<div class="rline"><span class="rk">ANCHOR</span><span class="rv">' +
            escapeHtml(record.anchor || "-") +
            "</span></div>",
          false
        );
      } else {
        renderResult(
          '<p class="result-status"><span class="status-pill" data-status="mismatch"><span class="dot"></span>No match - file has changed</span></p>' +
            '<div class="rline"><span class="rk">FILE</span><span class="rv">' +
            escapeHtml(chosenFile.name) +
            '</span></div>' +
            '<div class="rline"><span class="rk">EXPECTED</span><span class="rv">' +
            escapeHtml(record.fingerprint) +
            '</span></div>' +
            '<div class="rline"><span class="rk">GOT</span><span class="rv">' +
            hash +
            '</span></div>' +
            '<div class="rline"><span class="rk">SEALED AT</span><span class="rv">' +
            escapeHtml(record.sealedAt ? humanTime(record.sealedAt) : "-") +
            "</span></div>",
          true
        );
      }
    });

    if (verifyOnChainBtn) {
      verifyOnChainBtn.addEventListener("click", async () => {
        if (validationMsg) validationMsg.hidden = true;

        if (!chosenFile) {
          if (validationMsg) {
            validationMsg.hidden = false;
            validationMsg.textContent = "Choose a file before checking Sepolia.";
          }
          return;
        }

        const restore = setButtonBusy(verifyOnChainBtn, "Checking...");
        try {
          const hash = await sha256Hex(chosenFile);
          const contract = await getReadableContract();
          const exists = await contract.verifyFile(fileHashToBytes32(hash));
          const [sealer, sealedAt] = exists
            ? await contract.getProof(fileHashToBytes32(hash))
            : ["-", 0];

          renderResult(
            '<p class="result-status"><span class="status-pill" data-status="' +
              (exists ? "sealed" : "mismatch") +
              '"><span class="dot"></span>' +
              (exists ? "Found on Sepolia" : "Not found on Sepolia") +
              "</span></p>" +
              '<div class="rline"><span class="rk">FILE</span><span class="rv">' +
              escapeHtml(chosenFile.name) +
              '</span></div>' +
              '<div class="rline"><span class="rk">FINGERPRINT</span><span class="rv">' +
              hash +
              '</span></div>' +
              '<div class="rline"><span class="rk">SEALER</span><span class="rv">' +
              escapeHtml(sealer) +
              '</span></div>' +
              '<div class="rline"><span class="rk">SEALED AT</span><span class="rv">' +
              escapeHtml(sealedAt ? humanTime(Number(sealedAt) * 1000) : "-") +
              "</span></div>",
            !exists
          );
        } catch (error) {
          if (validationMsg) {
            validationMsg.hidden = false;
            validationMsg.textContent =
              error.reason || error.message || "Could not check Sepolia.";
          }
        } finally {
          restore();
        }
      });
    }
  }

  function initReveal() {
    const targets = document.querySelectorAll(
      ".section-head, .tag, .detail-row, .drop-card, .result-card"
    );
    if (!targets.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("reveal", "in-view"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    targets.forEach((el, i) => {
      el.classList.add("reveal");
      el.style.transitionDelay = Math.min(i % 3, 2) * 70 + "ms";
      observer.observe(el);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initWalletControls();
    initSealFlow();
    initVerifyFlow();
    initReveal();
  });
})();
