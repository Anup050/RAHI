import Link from "next/link"
import Image from "next/image"

const posts = [
  {
    category: "Health",
    title: "The Benefits of Regular Exercise: A Pathway to Health",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop",
    link: "#"
  },
  {
    category: "Wellness",
    title: "Managing Stress for Better Health: Strategies for a Calmer Life",
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=800&auto=format&fit=crop",
    link: "#"
  },
  {
    category: "Sleep",
    title: "The Impact of Sleep on Your Health: Why Rest Matters",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop",
    link: "#"
  }
]

export function BlogSection() {
  return (
    <section className="container py-12 md:py-24" id="blog">
      <div className="text-center mb-16">
        <h2 className="text-sm font-bold text-primary tracking-wide uppercase mb-4">● Blog</h2>
        <h3 className="text-3xl md:text-5xl font-bold text-foreground">
          Insights and tips for better <br />
          healthcare decisions
        </h3>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post, index) => (
          <Link key={index} href={post.link} className="group block">
            <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden mb-6 bg-secondary">
              <Image 
                src={post.image} 
                alt={post.title} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h4 className="text-xl md:text-2xl font-bold leading-tight group-hover:text-primary transition-colors">
              {post.title}
            </h4>
          </Link>
        ))}
      </div>
    </section>
  )
}
