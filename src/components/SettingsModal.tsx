"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { usePromptStore } from "@/store/usePromptStore";
import { SettingsIcon } from "lucide-react";
import { useState } from "react";

export function SettingsModal() {
    const { apiKey, setField } = usePromptStore();
    const [open, setOpen] = useState(false);
    const [tempKey, setTempKey] = useState(apiKey);

    const handleSave = () => {
        setField("apiKey", tempKey);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-3 px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={() => setTempKey(apiKey)}
                >
                    <SettingsIcon className="h-4 w-4" />
                    Settings
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>
                        Configure your API keys for AI-assisted features. Keys are stored locally in your browser.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="gemini-api-key" className="text-sm font-medium">
                            Gemini API Key
                        </label>
                        <input
                            id="gemini-api-key"
                            type="password"
                            placeholder="AIzaSy..."
                            value={tempKey}
                            onChange={(e) => setTempKey(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <p className="text-[10px] text-muted-foreground">
                            Used for the "Auto-Structure" feature. Get your key from Google AI Studio.
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
