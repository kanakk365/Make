import type React from "react"
export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="h-screen overflow-hidden">{children}</div>
}
