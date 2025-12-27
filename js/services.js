// js/services.js

/**
 * FUNÇÕES AUXILIARES (Lógica de Negócio)
 * Separadas para manter o código limpo e reutilizável
 */

async function garantirTutor() {
  const nome = document.getElementById("nome").value;
  const whatsapp = document.getElementById("whatsapp").value;

  let { data: tutor } = await supabaseClient
    .from("tutores")
    .select("id")
    .eq("whatsapp", whatsapp)
    .maybeSingle();

  if (!tutor) {
    const { data: nT, error: eT } = await supabaseClient
      .from("tutores")
      .insert([{ nome, whatsapp }])
      .select()
      .single();
    if (eT) throw eT;
    tutor = nT;
  }
  return { data: tutor };
}

async function garantirPet(tutorId) {
  const nomePet = document.getElementById("nomePet").value;

  let { data: pet } = await supabaseClient
    .from("pets")
    .select("id")
    .eq("tutor_id", tutorId)
    .eq("nome_pet", nomePet)
    .maybeSingle();

  if (!pet) {
    const { data: nP, error: eP } = await supabaseClient
      .from("pets")
      .insert([{ tutor_id: tutorId, nome_pet: nomePet }])
      .select()
      .single();
    if (eP) throw eP;
    pet = nP;
  }
  return { data: pet };
}

/**
 * CARREGAMENTO DE SERVIÇOS
 */
async function carregarServicos() {
  const select = document.getElementById("select-servicos");
  if (!select) return;

  try {
    const { data, error } = await supabaseClient
      .from("servicos")
      .select("*")
      .order("nome_servico");
    if (error) throw error;

    select.innerHTML = '<option value="">Selecione um serviço</option>';
    data.forEach((s) => {
      select.innerHTML += `<option value="${s.id}">${
        s.nome_servico
      } - R$ ${s.preco.toFixed(2)}</option>`;
    });
  } catch (e) {
    console.error("Erro ao buscar serviços:", e.message);
  }
}

/**
 * ENVIO DO FORMULÁRIO (Fluxo Unificado)
 */
const form = document.getElementById("appointmentForm");
if (form) {
  form.onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById("btnSubmit");
    const selectServico = document.getElementById("select-servicos");

    // --- CONFIGURAÇÃO DE VIDA REAL ---
    // IMPORTANTE: Use o UUID real do serviço "Assinatura" criado no seu Supabase
    const ID_SERVICO_PLANO_SISTEMA = "2a6f62f9-8bf5-41a9-8427-f7aabe1b10d2";

    let servicoIdFinal = selectServico.value;
    let anotacaoInterna = "";
    let ehPlano = false;

    // Detecta se é um plano (valor começa com ASSINAR)
    if (servicoIdFinal.includes("ASSINAR")) {
      ehPlano = true;
      anotacaoInterna = `SOLICITAÇÃO DE PLANO: ${servicoIdFinal.replace(
        "ASSINAR: ",
        ""
      )}`;
      servicoIdFinal = ID_SERVICO_PLANO_SISTEMA;
    }

    btn.disabled = true;
    btn.innerText = "PROCESSANDO...";

    try {
      // 1. Lógica de Tutor e Pet
      const { data: tutor } = await garantirTutor();
      const { data: pet } = await garantirPet(tutor.id);

      // 2. Gravação no Banco de Dados
      const { error: eA } = await supabaseClient
        .from("agendamentos_pro")
        .insert([
          {
            pet_id: pet.id,
            servico_id: servicoIdFinal,
            data_hora: document.getElementById("data_agendamento").value,
            observacoes: anotacaoInterna, // Salva o interesse do plano aqui
          },
        ]);

      if (eA) throw eA;

      alert(
        ehPlano
          ? "Interesse em plano registrado! Entraremos em contato. 🐾"
          : "Pet agendado com sucesso! 🐾"
      );
      location.reload();
    } catch (err) {
      alert("Erro ao processar: " + err.message);
      btn.disabled = false;
      btn.innerText = "Confirmar Agendamento";
    }
  };
}

/**
 * FUNÇÃO PARA OS BOTÕES DE PLANOS (Global)
 */
window.preencherPlano = function (nomePlano) {
  const section = document.getElementById("contact-section");
  if (section) section.scrollIntoView({ behavior: "smooth" });

  const selectServico = document.getElementById("select-servicos");
  if (selectServico) {
    const valorPlano = `ASSINAR: Plano ${nomePlano}`;
    let opcaoExiste = Array.from(selectServico.options).some(
      (opt) => opt.value === valorPlano
    );

    if (!opcaoExiste) {
      const novaOpcao = document.createElement("option");
      novaOpcao.value = valorPlano;
      novaOpcao.text = `⭐ INTERESSE: Plano ${nomePlano}`;
      selectServico.add(novaOpcao);
    }
    selectServico.value = valorPlano;
  }

  setTimeout(() => {
    const campoNome = document.getElementById("nome");
    if (campoNome) {
      campoNome.focus();
      campoNome.classList.add("border-accent");
    }
  }, 800);
};
