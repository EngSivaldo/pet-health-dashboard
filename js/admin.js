// js/admin.js

const Dashboard = {
  /**
   * Carrega os dados do banco e renderiza a tabela principal
   */
  async load() {
    const tbody = document.getElementById("table-body");
    if (!tbody) return;

    // Feedback visual de carregamento
    tbody.innerHTML =
      '<tr><td colspan="5" class="p-4 text-center text-complementary">Carregando agendamentos...</td></tr>';

    // Query completa trazendo todas as relações (Sênior: observacoes incluída para os Planos)
    const { data, error } = await supabaseClient
      .from("agendamentos_pro")
      .select(
        `
              id,
              data_hora, 
              status, 
              observacoes,
              pets (
                nome_pet, 
                tutores (nome, whatsapp)
              ), 
              servicos (nome_servico)
          `
      )
      .order("data_hora", { ascending: true });

    if (error) {
      console.error("Erro Supabase:", error);
      tbody.innerHTML =
        '<tr><td colspan="5" class="p-4 text-center text-red-500">Erro ao carregar dados.</td></tr>';
      return;
    }

    // Renderização da tabela
    tbody.innerHTML =
      data
        .map((row) => {
          // Estilização dinâmica de status
          const statusClasses =
            row.status === "Concluído"
              ? "bg-green-500/10 text-green-500 border-green-500/20"
              : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";

          // Fallbacks para dados ausentes (Prevenção de erros)
          const petNome = row.pets?.nome_pet || "Pet N/A";
          const tutorNome = row.pets?.tutores?.nome || "Tutor N/A";
          const tutorZap = row.pets?.tutores?.whatsapp || "";

          // Lógica de Identificação de Planos de Assinatura
          const obs = row.observacoes || "";
          const ehPlano = obs.includes("SOLICITAÇÃO DE PLANO");
          const nomeExibicaoPlano = ehPlano
            ? obs.replace("SOLICITAÇÃO DE PLANO: ", "").trim()
            : "";

          return `
              <tr class="border-b border-white/5 hover:bg-white/5 transition">
                  <td class="p-4 text-accent text-sm font-medium">
                      ${new Date(row.data_hora).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                  </td>

                  <td class="p-4">
                      <div class="font-bold text-slate-200">${petNome}</div>
                      <div class="flex items-center gap-2 text-xs text-complementary">
                        ${tutorNome}
                        ${
                          tutorZap
                            ? `
                          <a href="https://wa.me/55${tutorZap.replace(
                            /\D/g,
                            ""
                          )}" 
                             target="_blank" 
                             class="text-green-500 hover:text-green-400 transition-colors"
                             title="Chamar no WhatsApp">
                            <i class="fab fa-whatsapp"></i>
                          </a>`
                            : ""
                        }
                      </div>
                  </td>

                  <td class="p-4 text-sm text-slate-300">
                      <div class="flex flex-col gap-1">
                        <span class="${
                          ehPlano ? "text-[11px] opacity-60" : ""
                        }">
                          ${row.servicos?.nome_servico || "Serviço N/A"}
                        </span>
                        ${
                          ehPlano
                            ? `
                          <span class="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] px-2 py-0.5 rounded w-fit font-black uppercase tracking-wider">
                            <i class="fas fa-star mr-1 text-yellow-400"></i> ${nomeExibicaoPlano}
                          </span>`
                            : ""
                        }
                      </div>
                  </td>

                  <td class="p-4">
                      <span class="px-2 py-1 rounded text-[10px] uppercase font-bold border ${statusClasses}">
                          ${row.status || "Pendente"}
                      </span>
                  </td>

                  <td class="p-4 text-right">
                      <div class="flex justify-end gap-3">
                          <button onclick="viewPetHistory('${petNome}')" 
                                  class="text-blue-400 hover:text-blue-200 transition-colors" 
                                  title="Ver Histórico">
                              <i class="fas fa-history"></i>
                          </button>

                          ${
                            row.status !== "Concluído"
                              ? `
                              <button onclick="Dashboard.complete('${row.id}')" 
                                      class="text-emerald-500 hover:text-emerald-300 transition-colors" 
                                      title="Marcar como Concluído">
                                  <i class="fas fa-check-circle"></i>
                              </button>`
                              : ""
                          }

                          <button onclick="Dashboard.delete('${row.id}')" 
                                  class="text-red-500 hover:text-red-300 transition-colors" 
                                  title="Excluir Agendamento">
                              <i class="fas fa-trash-alt"></i>
                          </button>
                      </div>
                  </td>
              </tr>`;
        })
        .join("") ||
      '<tr><td colspan="5" class="p-4 text-center">Nenhum agendamento encontrado.</td></tr>';
  },

  /**
   * Altera o status do agendamento para Concluído
   */
  async complete(id) {
    try {
      const { error } = await supabaseClient
        .from("agendamentos_pro")
        .update({ status: "Concluído" })
        .eq("id", id);

      if (error) throw error;
      this.load(); // Recarrega a lista
    } catch (err) {
      console.error("Erro ao concluir:", err);
      alert("Erro ao concluir: " + err.message);
    }
  },

  /**
   * Remove o agendamento permanentemente
   */
  async delete(id) {
    if (!confirm("Tem certeza que deseja excluir este agendamento?")) return;

    try {
      const { error } = await supabaseClient
        .from("agendamentos_pro")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Sucesso: Recarregar dados após pequena pausa para o banco respirar
      setTimeout(() => {
        this.load();
      }, 300);
    } catch (err) {
      console.error("Erro ao excluir:", err);
      alert("Erro ao excluir agendamento: " + err.message);
    }
  },
}; // FIM DO OBJETO DASHBOARD

/**
 * Função Global para Ver Histórico (Fora do objeto para acessibilidade no HTML)
 */
window.viewPetHistory = function (nomePet) {
  if (!nomePet) return;
  Router.go("history");
  if (typeof History !== "undefined") {
    History.render("history-content", nomePet);
  }
};
