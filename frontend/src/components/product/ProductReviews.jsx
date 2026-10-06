"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import {
  createProductReview,
  getProductReviews,
} from "@/services/reviewService";

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!productId) return;

    async function loadReviews() {
      try {
        setLoading(true);
        setError("");

        const data = await getProductReviews(productId);
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load reviews:", err);
        setError("Unable to load reviews right now.");
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, [productId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!productId || !customerName.trim()) {
      setError("Please enter your name.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const newReview = await createProductReview({
        product_id: productId,
        customer_name: customerName.trim(),
        rating,
        comment: comment.trim() || null,
      });

      setReviews((current) => [newReview, ...current]);

      setCustomerName("");
      setRating(5);
      setComment("");
      setSuccess("Your review has been submitted.");
    } catch (err) {
      console.error("Failed to submit review:", err);
      setError(
        err?.response?.data?.detail ||
          "Unable to submit your review. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-16 border-t border-nera-gold/20 pt-12">
      <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Reviews */}
        <div>
          <div className="mb-8">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-nera-wine">
              Customer Reviews
            </p>

            <h2 className="mt-2 font-serif text-3xl text-nera-espresso">
              What customers say
            </h2>
          </div>

          {loading ? (
            <p className="text-sm text-nera-espresso/60">
              Loading reviews...
            </p>
          ) : error && reviews.length === 0 ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : reviews.length === 0 ? (
            <div className="border border-nera-gold/20 bg-nera-sand/30 p-6">
              <p className="text-sm text-nera-espresso/70">
                No reviews yet. Be the first to share your experience.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="border-b border-nera-gold/15 pb-6"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-sm font-medium text-nera-espresso">
                      {review.customer_name}
                    </h3>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          size={14}
                          strokeWidth={1.5}
                          fill={
                            index < review.rating
                              ? "currentColor"
                              : "none"
                          }
                          className={
                            index < review.rating
                              ? "text-nera-gold"
                              : "text-nera-espresso/25"
                          }
                        />
                      ))}
                    </div>
                  </div>

                  {review.comment && (
                    <p className="mt-3 text-sm leading-6 text-nera-espresso/70">
                      {review.comment}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Review Form */}
        <div className="bg-nera-sand/30 p-6 sm:p-8">
          <div className="mb-6">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-nera-wine">
              Share your experience
            </p>

            <h2 className="mt-2 font-serif text-2xl text-nera-espresso">
              Write a review
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="review-name"
                className="mb-2 block text-xs font-medium uppercase tracking-[0.1em] text-nera-espresso/70"
              >
                Your name
              </label>

              <input
                id="review-name"
                type="text"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Enter your name"
                className="h-12 w-full border border-nera-gold/25 bg-nera-white px-4 text-sm text-nera-espresso outline-none transition focus:border-nera-wine"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.1em] text-nera-espresso/70">
                Rating
              </label>

              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      aria-label={`Rate ${value} out of 5`}
                      className="p-1 text-nera-gold"
                    >
                      <Star
                        size={20}
                        strokeWidth={1.5}
                        fill={value <= rating ? "currentColor" : "none"}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="review-comment"
                className="mb-2 block text-xs font-medium uppercase tracking-[0.1em] text-nera-espresso/70"
              >
                Comment
              </label>

              <textarea
                id="review-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Share your experience"
                rows={5}
                className="w-full resize-none border border-nera-gold/25 bg-nera-white px-4 py-3 text-sm text-nera-espresso outline-none transition focus:border-nera-wine"
              />
            </div>

            {error && reviews.length > 0 && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            {success && (
              <p className="text-sm text-green-700">{success}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex min-h-12 w-full items-center justify-center bg-nera-wine px-5 text-xs font-medium uppercase tracking-[0.12em] text-nera-white transition hover:bg-nera-espresso disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}