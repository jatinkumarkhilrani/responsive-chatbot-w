import React, { memo, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface SettingsDialogProps {
  isOpen: boolean
  onClose: () => void
}

export const SettingsDialog = memo(({ isOpen, onClose }: SettingsDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">AI Configuration</h3>
            <p className="text-sm text-muted-foreground">
              Configure your AI model settings and API keys.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Privacy Settings</h3>
            <p className="text-sm text-muted-foreground">
              Manage your privacy preferences and data sharing.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
})

SettingsDialog.displayName = 'SettingsDialog'