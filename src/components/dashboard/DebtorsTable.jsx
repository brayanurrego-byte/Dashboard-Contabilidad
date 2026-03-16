import { useMemo } from "react";
import { AlertCircle } from "lucide-react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";

export function DebtorsTable({ students }) {
  const debtors = useMemo(() => {
    return students.filter((s) => {
      const cartera = String(s.cartera).toLowerCase().trim();
      // Student has debt if cartera field doesn't indicate they've paid/completed
      const hasPaid = ["cumple", "si", "sí", "ok", "x", "✓", "✔", "paz y salvo", "listo"].some(
        (w) => cartera.includes(w)
      );
      return !hasPaid && cartera !== "—" && cartera !== "";
    });
  }, [students]);

  if (debtors.length === 0) {
    return (
      <Card hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-status-paid" />
          <h2 className="font-heading font-bold text-xl text-white">Deudores / Cobranza</h2>
        </div>
        <p className="text-sm text-gray-500 text-center py-6">
          No se identificaron estudiantes con deuda pendiente.
        </p>
      </Card>
    );
  }

  return (
    <Card hover={false}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-status-pending" />
          <h2 className="font-heading font-bold text-xl text-white">Deudores / Cobranza</h2>
        </div>
        <span className="text-sm text-gray-400 bg-white/5 px-3 py-1 rounded-full">
          {debtors.length} estudiantes
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left py-2.5 px-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Nombre</th>
              <th className="text-left py-2.5 px-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Cédula</th>
              <th className="text-left py-2.5 px-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Programa</th>
              <th className="text-left py-2.5 px-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Estado Cartera</th>
              <th className="text-left py-2.5 px-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody>
            {debtors.map((s, i) => (
              <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                <td className="py-2.5 px-3 text-gray-200">{s.nombreCompleto}</td>
                <td className="py-2.5 px-3 text-gray-400">{s.cedula}</td>
                <td className="py-2.5 px-3 text-gray-400 max-w-[200px] truncate">{s.programa}</td>
                <td className="py-2.5 px-3 text-status-pending text-xs">{s.cartera}</td>
                <td className="py-2.5 px-3"><Badge status={s.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
