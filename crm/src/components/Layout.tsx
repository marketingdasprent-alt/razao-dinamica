import { NavLink, Outlet } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useLeadSheet } from '@/hooks/useLeadSheet'
import CommandPalette from '@/components/CommandPalette'
import LeadSheet from '@/components/crm/LeadSheet'

const linkBase = 'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors'
const linkActive = 'bg-gold text-navy'
const linkInactive = 'text-sand/70 hover:bg-white/10 hover:text-sand'

export default function Layout() {
  const { session } = useAuth()
  const { selected, openLead, closeLead } = useLeadSheet()

  return (
    <div className="min-h-screen flex bg-sand">
      <aside className="w-56 flex-shrink-0 bg-navy text-sand flex flex-col">
        <div className="px-4 py-5">
          <div className="font-display font-extrabold text-base leading-none">Razão Dinâmica</div>
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold mt-1">CRM de leads</div>
        </div>

        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
          className="mx-3 mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sand/50 text-xs hover:bg-white/10 hover:text-sand/80 transition-colors"
        >
          <SearchIcon />
          Pesquisar
          <kbd className="ml-auto font-mono text-[10px] bg-white/10 rounded px-1.5 py-0.5">⌘K</kbd>
        </button>

        <nav className="flex-1 flex flex-col gap-1 px-3">
          <NavLink to="/" end className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
            <GridIcon /> Dashboard
          </NavLink>
          <NavLink to="/leads" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
            <UsersIcon /> Leads
          </NavLink>
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="text-[11px] text-sand/40 truncate px-1 mb-2">{session?.user.email}</div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full text-left px-3 py-2 rounded-lg text-xs text-sand/60 hover:bg-white/10 hover:text-sand transition-colors"
          >
            Terminar sessão
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Outlet />
        </div>
      </main>

      <CommandPalette onOpenLead={openLead} />
      {selected && <LeadSheet lead={selected} onClose={closeLead} />}
    </div>
  )
}

function SearchIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
}
function GridIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
}
function UsersIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
}
