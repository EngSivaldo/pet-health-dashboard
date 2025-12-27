// js/history.js

const History = {
  // Função para buscar o histórico de um pet específico
  async loadByPet(nomePet) {
    console.log(`Buscando histórico para: ${nomePet}`);

    try {
      const { data, error } = await supabaseClient
        .from("agendamentos_pro")
        .select(
          `
                  data_hora, 
                  status, 
                  servicos (nome_servico, preco),
                  pets!inner (nome_pet)
              `
        )
        .eq("pets.nome_pet", nomePet)
        .order("data_hora", { ascending: false });

      if (error) throw error;

      return data;
    } catch (err) {
      console.error("Erro ao carregar histórico:", err.message);
      return [];
    }
  },

  // Função para renderizar o histórico em algum elemento da tela
  async render(containerId, nomePet) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML =
      '<p class="text-center p-4 text-complementary">Carregando histórico...</p>';

    const historico = await this.loadByPet(nomePet);

    if (historico.length === 0) {
      container.innerHTML =
        '<p class="text-center p-4">Nenhum registro encontrado para este pet.</p>';
      return;
    }

    container.innerHTML = historico
      .map(
        (item) => `
          <div class="bg-white/5 p-3 rounded-lg mb-2 border-l-4 ${
            item.status === "Concluído" ? "border-green-500" : "border-accent"
          }">
              <div class="flex justify-between items-start">
                  <div>
                      <div class="font-bold text-sm">${
                        item.servicos.nome_servico
                      }</div>
                      <div class="text-xs text-complementary">${new Date(
                        item.data_hora
                      ).toLocaleDateString()} às ${new Date(
          item.data_hora
        ).toLocaleTimeString()}</div>
                  </div>
                  <div class="text-xs font-semibold">${item.status}</div>
              </div>
          </div>
      `
      )
      .join("");
  },
};
