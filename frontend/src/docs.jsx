import React from "react";
import "./docs.css";

export default function DocsPage() {
  const features = [
    {
      title: "Request Items",
      description:
        "Students can submit requests for any items they need within the college. Include item details, quantity, urgency, and preferred delivery time.",
      img: "https://images.unsplash.com/photo-1591696331111-4d8c0a9d68b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    },
    {
      title: "Fulfill Requests",
      description:
        "Other students going outside can view available requests, accept them, deliver items, and earn delivery charges safely.",
      img: "https://images.unsplash.com/photo-1598300050750-2c8474769c0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    },
    {
      title: "Secure Transactions",
      description:
        "All delivery charges are credited to student wallets securely. Reliable payment integrations ensure safe transactions.",
      img: "https://images.unsplash.com/photo-1581091870627-7ecb7ebd8d9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    },
    {
      title: "Track Requests",
      description:
        "Track the status of your requests in real-time. Get notifications when a request is accepted, in progress, or completed.",
      img: "https://images.unsplash.com/photo-1591696331837-d2b1589f2f8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    },
    {
      title: "User-Friendly Dashboard",
      description:
        "Intuitive dashboard for requesters and deliverers. Manage requests, check balances, and view history easily.",
      img: "https://images.unsplash.com/photo-1612831455543-b1b8b2f2c2d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    },
  ];

  return (
    <div className="docs-container">
      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">College Carrt Documentation</h1>
        <p className="hero-desc">
          Your complete guide to using College Carrt – request items, fulfill
          deliveries, and earn safely within your college.
        </p>
        <img
          src="https://images.unsplash.com/photo-1591696330952-cb3c4b8b9f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800"
          alt="College Collaboration"
          className="hero-img"
        />
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          {features.map((feature, idx) => (
            <div className="feature-card" key={idx}>
              <img src={feature.img} alt={feature.title} className="feature-img" />
              <div className="feature-content">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
              <div className="feature-badge">Feature</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-section">
        <h2>How It Works</h2>
        <div className="how-step">
          <img
            src="https://images.unsplash.com/photo-1591696330952-cb3c4b8b9f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400"
            alt="Request"
          />
          <div>
            <h3>Submit Request</h3>
            <p>
              Students can submit requests for any item they need. Include
              quantity, urgency, and delivery preferences. Requests appear for
              others to fulfill.
            </p>
          </div>
        </div>

        <div className="how-step reverse">
          <img
            src="https://images.unsplash.com/photo-1598300050750-2c8474769c0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400"
            alt="Deliver"
          />
          <div>
            <h3>Accept & Deliver Requests</h3>
            <p>
              Students going outside can view available requests and accept them.
              Deliver items, mark complete, and earn delivery charges safely.
            </p>
          </div>
        </div>

        <div className="how-step">
          <img
            src="https://images.unsplash.com/photo-1581091870627-7ecb7ebd8d9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400"
            alt="Secure"
          />
          <div>
            <h3>Secure Payments</h3>
            <p>
              Delivery charges are credited automatically to your wallet. All
              transactions are safe and secure, giving peace of mind to all users.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <details className="faq-card">
          <summary>How do I request an item?</summary>
          <p>Login, go to 'Request Item', fill details, and submit. Track requests from your dashboard.</p>
        </details>

        <details className="faq-card">
          <summary>How do I earn delivery charges?</summary>
          <p>Accept requests and complete deliveries. Charges are added to your wallet securely after completion.</p>
        </details>

        <details className="faq-card">
          <summary>Is my information secure?</summary>
          <p>Yes! Authentication and database validation keep all data secure.</p>
        </details>
      </section>

      {/* Support Section */}
      <section className="support-section">
        <h2>Need More Help?</h2>
        <p>
          Contact our support team anytime at{" "}
          <a href="mailto:support@collegecarrt.com">support@collegecarrt.com</a>
        </p>
        <button>Contact Support</button>
      </section>
    </div>
  );
}
