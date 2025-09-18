import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TestTube, Wrench } from '@phosphor-icons/react'
import { UITester } from './UITester'
import { HealthChecker } from './HealthChecker'

export function DebugPanel() {
  return (
    <div className="h-full p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TestTube className="w-6 h-6" />
            Debug & Diagnostics
          </h1>
          <p className="text-muted-foreground">
            Tools to test, debug, and optimize your Sahaay app
          </p>
        </div>

        <Tabs defaultValue="health" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="health" className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Health Check
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              UI Testing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="health">
            <HealthChecker />
          </TabsContent>

          <TabsContent value="testing">
            <UITester />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}