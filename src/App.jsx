import { useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useGoogleSheets } from "./hooks/useGoogleSheets";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { KPICards } from "./components/dashboard/KPICards";
import { StatusOverview } from "./components/dashboard/StatusOverview";
import { StudentSearch } from "./components/dashboard/StudentSearch";
import { ProgramSection } from "./components/dashboard/ProgramSection";
import { DebtorsTable } from "./components/dashboard/DebtorsTable";
import { StudentsTable } from "./components/dashboard/StudentsTable";
import { CardSkeleton, TableSkeleton } from "./components/ui/Skeleton";

const tabs = [
  { key: "overview", label: "General" },
  { key: "programs", label: "Programas" },
  { key: "search", label: "Buscar" },
  { key: "table", label: "Tabla" },
  { key: "debtors", label: "Cobranza" },
];

export default function App() {
  const { students, headers, loading, error, lastUpdate, refreshing, forceRefresh } = useGoogleSheets();
  const [activeTab, setActiveTab] = useState("overview");

  const heroBg = (
    <div className="hero-bg">
      <div className="hero-bg__image" />
      <div className="hero-bg__gradient" />
      <div className="hero-bg__vignette" />
    </div>
  );

  // Loading state with skeleton UI
  if (loading) {
    return (
      <div className="min-h-screen relative">
        {heroBg}
        <Header refreshing={false} onRefresh={() => {}} />
        <main className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <TableSkeleton rows={8} />
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen relative">
        {heroBg}
        <Header refreshing={refreshing} onRefresh={forceRefresh} />
        <main className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="glass-strong p-8 text-center max-w-lg mx-auto mt-20">
            <AlertCircle className="w-12 h-12 text-status-pending mx-auto mb-4" />
            <h2 className="font-heading font-bold text-xl text-white mb-2">
              Error al cargar datos
            </h2>
            <p className="text-gray-400 text-sm mb-6">{error}</p>
            <button
              onClick={forceRefresh}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/20 hover:bg-accent-cyan/25 transition-all font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {heroBg}
      <Header refreshing={refreshing} onRefresh={forceRefresh} />

      <main className="relative z-10 flex-1 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Navigation Tabs */}
        <nav className="flex gap-1 mb-8 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === t.key
                  ? "bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/20 glow-blue"
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Tab content */}
        <div className="space-y-8">
          {activeTab === "overview" && (
            <>
              <KPICards students={students} />
              <StatusOverview students={students} />
            </>
          )}

          {activeTab === "programs" && (
            <ProgramSection students={students} />
          )}

          {activeTab === "search" && (
            <StudentSearch students={students} />
          )}

          {activeTab === "table" && (
            <StudentsTable students={students} headers={headers} />
          )}

          {activeTab === "debtors" && (
            <DebtorsTable students={students} />
          )}
        </div>
      </main>

      <Footer lastUpdate={lastUpdate} />
    </div>
  );
}
