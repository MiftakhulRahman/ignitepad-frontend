import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4">
      {/* Hero Section */}
      <section className="py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Welcome to <span className="text-primary">Ignitepad</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Platform Akademik Kolaboratif untuk berbagi, mengembangkan, dan
          berkolaborasi dalam proyek akademik Anda.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/projects">
            <Button size="lg">Explore Projects</Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline">
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose Ignitepad?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-lg">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-2">Share Your Projects</h3>
            <p className="text-muted-foreground">
              Showcase your academic projects to the community and get valuable
              feedback.
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold mb-2">Collaborate</h3>
            <p className="text-muted-foreground">
              Work together with peers and mentors on exciting academic
              challenges.
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold mb-2">Join Challenges</h3>
            <p className="text-muted-foreground">
              Participate in academic challenges and compete with fellow
              students.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center bg-muted/50 rounded-lg my-16">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-muted-foreground mb-6">
          Join thousands of students and educators already using Ignitepad
        </p>
        <Link href="/register">
          <Button size="lg">Create Your Account</Button>
        </Link>
      </section>
    </div>
  );
}
