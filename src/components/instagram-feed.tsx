import Image from "next/image";
import { Instagram, ArrowRight, Play, Layers } from "lucide-react";
import type { InstagramPost } from "@/lib/instagram";
import { SOCIAL_LINKS } from "@/lib/constants";

interface Props {
  posts: InstagramPost[];
  handle?: string;
}

export function InstagramFeed({ posts, handle = "culinariumambiesenhorst" }: Props) {
  if (posts.length === 0) return null;

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider bg-primary/5 px-4 py-1.5 rounded-full">
            <Instagram className="h-3.5 w-3.5" />
            @{handle}
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-neutral-800 mt-4">
            Aus unserer Küche
          </h2>
          <p className="text-neutral-500 mt-3 max-w-md mx-auto">
            Aktuelle Eindrücke — direkt von unserem Instagram
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {posts.slice(0, 8).map((post) => (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-2xl bg-warm-100 card-hover"
            >
              <Image
                src={post.thumbnailUrl || post.mediaUrl}
                alt={post.caption?.slice(0, 80) ?? "Instagram Post"}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized
              />

              {post.mediaType === "CAROUSEL_ALBUM" && (
                <div className="absolute top-2.5 right-2.5 bg-black/40 backdrop-blur-sm p-1.5 rounded-lg">
                  <Layers className="h-3.5 w-3.5 text-white" />
                </div>
              )}
              {post.mediaType === "VIDEO" && (
                <div className="absolute top-2.5 right-2.5 bg-black/40 backdrop-blur-sm p-1.5 rounded-lg">
                  <Play className="h-3.5 w-3.5 text-white fill-white" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div className="text-white">
                  <Instagram className="h-5 w-5 mb-1.5" />
                  {post.caption && (
                    <p className="text-xs line-clamp-2 leading-snug text-white/90">
                      {post.caption}
                    </p>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href={SOCIAL_LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 text-primary font-semibold hover:text-primary-dark transition-colors text-lg"
          >
            Mehr auf Instagram ansehen
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
