import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COMMENTS_API_BASE = "https://localhost:7181/v1/Comments";

export default function Comments({ token, hotelId, userId, showToast }) {
  const [comments, setComments] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    serviceType: "",
    rating: 5,
    text: "",
  });

  useEffect(() => {
    if (!hotelId) return;
    loadComments();
    loadDistribution();
  }, [hotelId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${COMMENTS_API_BASE}/${hotelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load comments");
      const data = await res.json();
      setComments(data);
    } catch (err) {
      showToast?.(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const loadDistribution = async () => {
    try {
      const res = await fetch(`${COMMENTS_API_BASE}/distribution/${hotelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load comment distribution");
      const data = await res.json();
      setDistribution(data);
    } catch (err) {
      showToast?.(err.message, true);
    }
  };

  const submitComment = async () => {
    if (!form.serviceType || !form.text || !form.rating) {
      showToast("Please fill all comment fields.", true);
      return;
    }

    const commentPayload = {
      hotelId,
      serviceType: form.serviceType,
      rating: form.rating,
      text: form.text,
      userId: userId ? parseInt(userId) : null,
    };

    try {
      const res = await fetch(COMMENTS_API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(commentPayload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to add comment: ${errorText}`);
      }

      showToast("Comment added successfully!");

      // Clear form and reload comments + distribution
      setForm({ serviceType: "", rating: 5, text: "" });
      loadComments();
      loadDistribution();
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const chartData = distribution.map((d) => ({
    serviceType: d.serviceType,
    ...[1, 2, 3, 4, 5].reduce((acc, rating) => {
      acc[rating] = d.ratingCounts[rating] || 0;
      return acc;
    }, {}),
  }));

  return (
    <div style={{ maxWidth: 600, marginTop: 20, fontFamily: "Arial, sans-serif" }}>
      <h3>Add Comment</h3>
      <div style={{ marginBottom: 20 }}>
        <label>
          Service Type:
          <input
            type="text"
            value={form.serviceType}
            onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
            style={{ width: "100%", marginTop: 4, marginBottom: 8, padding: 6 }}
          />
        </label>

        <label>
          Rating:
          <select
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) })}
            style={{ width: "100%", marginTop: 4, marginBottom: 8, padding: 6 }}
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} Star{r > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </label>

        <label>
          Comment:
          <textarea
            rows={3}
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
            style={{ width: "100%", marginTop: 4, padding: 6 }}
          />
        </label>

        <button
          onClick={submitComment}
          style={{
            marginTop: 10,
            padding: "0.5rem 1rem",
            backgroundColor: "#27ae60",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            width: "100%",
          }}
        >
          Submit Comment
        </button>
      </div>

      <h3>Comments</h3>
      {loading ? (
        <p>Loading comments...</p>
      ) : comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        comments.map((c) => (
          <div
            key={c.id}
            style={{
              borderBottom: "1px solid #ddd",
              paddingBottom: 8,
              marginBottom: 8,
            }}
          >
            <strong>{c.serviceType}</strong> — Rating: {c.rating}
            <br />
            {c.text}
            <br />
            <small>
              {new Date(c.createdAt).toLocaleDateString()}{" "}
              {c.userId ? `User ID: ${c.userId}` : "Anonymous"}
            </small>
          </div>
        ))
      )}

      <h3>Comments Distribution</h3>
      {distribution.length === 0 ? (
        <p>No distribution data</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barCategoryGap="15%"
          >
            <XAxis dataKey="serviceType" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="1" fill="#e74c3c" name="1 Star" />
            <Bar dataKey="2" fill="#e67e22" name="2 Stars" />
            <Bar dataKey="3" fill="#f1c40f" name="3 Stars" />
            <Bar dataKey="4" fill="#2ecc71" name="4 Stars" />
            <Bar dataKey="5" fill="#27ae60" name="5 Stars" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
