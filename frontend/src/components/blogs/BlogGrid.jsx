import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

const posts = [
  {
    id: 1,
    category: "Craft",
    title: "The story behind Kanchipuram silk",
    description:
      "Explore the craftsmanship, traditions, and details that make Kanchipuram silk timeless.",
    image: "/images/blogs/kanchipuram.jpg",
    slug: "story-behind-kanchipuram-silk",
  },
  {
    id: 2,
    category: "Guide",
    title: "How to choose a silk saree",
    description:
      "A simple guide to understanding weave, fabric, zari, colour, and occasion before you choose.",
    image: "/images/blogs/choose-silk.jpg",
    slug: "how-to-choose-silk-saree",
  },
  {
    id: 3,
    category: "Heritage",
    title: "Understanding the art of zari",
    description:
      "From traditional techniques to modern interpretations, discover what makes zari special.",
    image: "/images/blogs/zari.jpg",
    slug: "understanding-the-art-of-zari",
  },
];

export default function BlogGrid() {
  return (
    <section className="bg-nera-ivory py-16 sm:py-20 lg:py-24">
      <div className="nera-container">

        <div className="mb-10 flex items-end justify-between gap-6 sm:mb-14">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-nera-gold">
              From the Journal
            </p>

            <h2 className="mt-3 font-serif text-3xl font-normal text-nera-espresso sm:text-4xl">
              Explore our stories
            </h2>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group overflow-hidden bg-nera-white"
            >
              {/* Image */}
              <Link href={`/blogs/${post.slug}`} className="block">
                <div className="relative aspect-[5/3] overflow-hidden bg-nera-sand">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              </Link>

              {/* Content */}
              <div className="p-6 sm:p-7">
                <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-nera-gold">
                  {post.category}
                </p>

                <h3 className="mt-3 font-serif text-2xl leading-tight text-nera-espresso">
                  {post.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-nera-espresso/55">
                  {post.description}
                </p>

                <Link
                  href={`/blogs/${post.slug}`}
                  className="mt-6 inline-flex items-center gap-2 text-[9px] font-medium uppercase tracking-[0.18em] text-nera-wine transition hover:text-nera-gold"
                >
                  Read story
                  <ArrowUpRight
                    size={14}
                    strokeWidth={1.5}
                    className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </Link>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}