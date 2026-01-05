import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MessageCircle, BookOpen, Mail, Search } from 'lucide-react'
import { requireUser } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function HelpPage() {
  const user = await requireUser()

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <h1 className="text-4xl font-bold">How can we help?</h1>
        <p className="text-muted-foreground">
          Search our docs or contact support
        </p>
        
        {/* Search */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for help..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card className="hover:shadow-soft-lg transition-all duration-200 cursor-pointer">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Documentation</CardTitle>
            <CardDescription>
              Browse our comprehensive guides
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">View Docs</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-soft-lg transition-all duration-200 cursor-pointer">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Live Chat</CardTitle>
            <CardDescription>
              Get instant help from our team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Start Chat</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-soft-lg transition-all duration-200 cursor-pointer">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Email Support</CardTitle>
            <CardDescription>
              Send us a detailed message
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Send Email</Button>
          </CardContent>
        </Card>
      </div>

      {/* Popular Articles */}
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold">Popular Articles</h2>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Getting Started with CommercePix</CardTitle>
              <CardDescription>
                Learn how to create your first Amazon-ready product images
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Understanding Image Modes</CardTitle>
              <CardDescription>
                Deep dive into Main, Lifestyle, Feature Callout, and Packaging modes
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Amazon Compliance Guidelines</CardTitle>
              <CardDescription>
                Ensure your images meet Amazon's image requirements
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rate Limits & Usage</CardTitle>
              <CardDescription>
                Understanding your generation limits and how to manage them
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Troubleshooting Common Issues</CardTitle>
              <CardDescription>
                Solutions to frequently encountered problems
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Contact Info */}
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-primary/5 via-transparent to-transparent">
          <CardContent className="py-8 text-center">
            <h3 className="text-xl font-semibold mb-2">Still need help?</h3>
            <p className="text-muted-foreground mb-4">
              Our support team is here to assist you
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button>Contact Support</Button>
              <Button variant="outline">Schedule a Call</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

