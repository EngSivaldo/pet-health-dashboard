-- 1. Tabela de Tutores (Donos dos Pets)
CREATE TABLE IF NOT EXISTS tutores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    whatsapp TEXT UNIQUE NOT NULL, -- Usaremos o WhatsApp como identificador único
    cpf TEXT,
    email TEXT,
    endereco TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Pets (Vinculados a um Tutor)
CREATE TABLE IF NOT EXISTS pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID REFERENCES tutores(id) ON DELETE CASCADE, -- Liga o pet ao dono
    nome_pet TEXT NOT NULL,
    especie TEXT, -- Cão, Gato, etc.
    raca TEXT,
    peso DECIMAL,
    nascimento DATE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Serviços (Tabela de Preços/Opções)
CREATE TABLE IF NOT EXISTS servicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_servico TEXT NOT NULL,
    preco DECIMAL DEFAULT 0,
    duracao_minutos INTEGER DEFAULT 30
);

-- 4. Tabela de Agendamentos (A versão profissional da sua tabela atual)
CREATE TABLE IF NOT EXISTS agendamentos_pro (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    servico_id UUID REFERENCES servicos(id),
    data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'Pendente', -- Pendente, Concluído, Cancelado
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);