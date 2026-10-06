import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

const posts = {
  "story-behind-kanchipuram-silk": {
    category: "Craft",
    title: "The story behind Kanchipuram silk",
    description:
      "Explore the craftsmanship, traditions, and details that make Kanchipuram silk timeless.",
    image: "/images/blogs/kanchipuram.jpg",
    content: [
      "Kanchipuram silk has a special place in the world of Indian textiles. Known for its rich texture, intricate borders, and distinctive zari work, each saree carries a story of craftsmanship.",
      "The beauty of a Kanchipuram saree begins with the weaving process. Skilled artisans carefully bring together silk threads and detailed motifs to create a fabric that feels both luxurious and enduring.",
      "Traditional designs often draw inspiration from temples, nature, architecture, and generations of South Indian textile heritage.",
    ],
  },

  "how-to-choose-silk-saree": {
    category: "Guide",
    title: "How to choose a silk saree",
    description:
      "A simple guide to understanding weave, fabric, zari, colour, and occasion before you choose.",
    image: "/images/blogs/choose-silk.jpg",
    content: [
      "Choosing a silk saree becomes easier when you know what details to look for. Fabric, weave, colour, zari, and the occasion all play an important role.",
      "For weddings and special celebrations, richer fabrics and detailed zari borders can create a traditional and elegant look. For festive or everyday occasions, lighter silks can offer comfort while still feeling special.",
      "Most importantly, choose a saree that feels right for you. The colour, texture, and craftsmanship should complement both the occasion and your personal style.",
    ],
  },

  "understanding-the-art-of-zari": {
    category: "Heritage",
    title: "Understanding the art of zari",
    description:
      "From traditional techniques to modern interpretations, discover what makes zari special.",
    image: "/images/blogs/zari.jpg",
    content: [
      "Zari is one of the details that gives many traditional Indian sarees their distinctive character. Its metallic shine adds depth and richness to the fabric.",
      "Traditional zari designs can range from delicate floral patterns to bold temple-inspired borders. The motifs often reflect the cultural heritage of the region where the textile is created.",
      "When woven thoughtfully, zari becomes more than decoration. It becomes part of the story and character of the saree itself.",
    ],
  },
};

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const post = posts[slug];

  if (!post) {
    return (
      <main className="bg-nera-ivory">
        <div className="nera-container py-24 text-center">
          <h1 className="font-serif text-4xl text-nera-espresso">
            Story not found
          </h1>

          <Link
            href="/blogs"
            className="mt-8 inline-flex border border-nera-wine px-6 py-3 text-[9px] uppercase tracking-[0.18em] text-nera-wine"
          >
            Back to Journal
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-nera-ivory">

      {/* Hero */}
      <section className="bg-nera-espresso">
        <div className="nera-container">
          <div className="mx-auto max-w-4xl py-14 sm:py-18 lg:py-24">

            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-nera-white/50 transition hover:text-nera-gold"
            >
              <ArrowLeft size={14} strokeWidth={1.4} />
              Back to Journal
            </Link>

            <p className="mt-10 text-[10px] font-medium uppercase tracking-[0.24em] text-nera-gold">
              {post.category}
            </p>

            <h1 className="mt-4 font-serif text-4xl font-normal leading-[1.08] text-nera-white sm:text-5xl lg:text-6xl">
              {post.title}
            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-nera-white/55 sm:text-base">
              {post.description}
            </p>

          </div>
        </div>
      </section>

      {/* Article */}
      <section className="py-14 sm:py-18 lg:py-24">
        <div className="nera-container">

          <div className="mx-auto max-w-4xl">

            {/* Image */}
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image
                src={post.image}
                alt={post.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 900px"
              />
            </div>

            {/* Content */}
            <article className="mx-auto max-w-2xl py-12 sm:py-16">

              {post.content.map((paragraph, index) => (
                <p
                  key={index}
                  className="mb-7 text-base leading-8 text-nera-espresso/65 sm:text-lg"
                >
                  {paragraph}
                </p>
              ))}

              {/* Closing */}
              <div className="mt-12 border-l-2 border-nera-gold pl-6">
                <p className="font-serif text-xl leading-8 text-nera-wine sm:text-2xl">
                  Tradition gives us the story. We bring it closer to you.
                </p>
              </div>

            </article>

          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-nera-sand py-16 sm:py-20">
        <div className="nera-container text-center">

          <p className="text-[10px] uppercase tracking-[0.22em] text-nera-gold">
            Discover more
          </p>

          <h2 className="mt-4 font-serif text-3xl text-nera-espresso sm:text-4xl">
            Explore our silk collection.
          </h2>

          <Link
            href="/collections"
            className="mt-7 inline-flex min-h-12 items-center bg-nera-wine px-7 text-[9px] font-medium uppercase tracking-[0.18em] text-nera-white transition hover:bg-nera-espresso"
          >
            Explore Collection
          </Link>

        </div>
      </section>

    </main>
  );
}