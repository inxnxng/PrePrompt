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
import { Language, translations } from "@/lib/i18n";
import { usePromptStore } from "@/store/usePromptStore";
import { SettingsIcon } from "lucide-react";
import { useState } from "react";

export function SettingsModal() {
    const { apiKey, language, setField } = usePromptStore();
    const [open, setOpen] = useState(false);
    const [tempKey, setTempKey] = useState(apiKey);
    const [tempLang, setTempLang] = useState<Language>(language);

    const handleSave = () => {
        setField("apiKey", tempKey);
        setField("language", tempLang);
        setOpen(false);
    };

    const handleOpen = (val: boolean) => {
        if (val) {
            setTempKey(apiKey);
            setTempLang(language);
        }
        setOpen(val);
    };

    const t = translations[language];

    return (
        <Dialog open={open} onOpenChange={handleOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-3 px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                    <SettingsIcon className="h-4 w-4" />
                    {t.settings}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t.settingsTitle}</DialogTitle>
                    <DialogDescription>
                        {t.settingsDesc}
                        <br /><br />
                        <strong className="text-foreground">Security Note:</strong> {t.settingsSecurity}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    {/* API Key */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="gemini-api-key" className="text-sm font-medium">
                            {t.geminiApiKey}
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
                            {t.geminiApiKeyHint}
                        </p>
                    </div>

                    {/* Language Toggle */}
                    <div className="flex flex-col gap-2 border-t border-border pt-4">
                        <label className="text-sm font-medium">
                            {t.language}
                        </label>
                        <div className="flex bg-muted/50 p-1 rounded-md">
                            <button
                                onClick={() => setTempLang("en")}
                                className={`flex-1 text-sm py-1.5 rounded-sm transition-all ${tempLang === "en" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                English
                            </button>
                            <button
                                onClick={() => setTempLang("ko")}
                                className={`flex-1 text-sm py-1.5 rounded-sm transition-all ${tempLang === "ko" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                한국어
                            </button>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        {t.cancel}
                    </Button>
                    <Button onClick={handleSave}>{t.saveChanges}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
