"use client"

export function PrivacyPolicy() {
  return (
    <div className="space-y-6 text-sm leading-relaxed max-w-4xl mx-auto">
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Política de Privacidade</h1>
        <p className="text-xs text-muted-foreground">
          Meu Controle Financeiro
        </p>
        <p className="text-xs text-muted-foreground">
          Última atualização: Janeiro de 2026
        </p>
      </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">1. Introdução</h2>
          <p className="text-muted-foreground">
            Esta Política de Privacidade descreve como o <span className="font-semibold">Meu Controle Financeiro</span> ("nós", 
            "nosso" ou "Aplicativo") coleta, usa, armazena e protege suas informações pessoais e dados financeiros, 
            em conformidade com a <span className="font-semibold">Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018)</span>.
          </p>
          <p className="text-muted-foreground font-semibold">
            Levamos sua privacidade a sério. Esta política explica seus direitos e como exercê-los.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">2. Dados Coletados</h2>
          
          <h3 className="text-base font-semibold text-foreground mt-3">2.1. Dados de Identificação</h3>
          <p className="text-muted-foreground">
            Através do serviço de autenticação Clerk, coletamos:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
            <li>Nome completo</li>
            <li>Endereço de e-mail</li>
            <li>Foto de perfil (opcional)</li>
            <li>Identificador único de usuário (User ID)</li>
            <li>Data de criação da conta</li>
          </ul>

          <h3 className="text-base font-semibold text-foreground mt-3">2.2. Dados Financeiros Pessoais</h3>
          <p className="text-muted-foreground">
            Você fornece voluntariamente as seguintes informações financeiras sensíveis:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
            <li>Despesas mensais (descrição, valor, categoria, data)</li>
            <li>Receitas e rendimentos (fonte, valor, categoria, data)</li>
            <li>Faturas de cartão de crédito (cartão, valor, itens, divisão por pessoa)</li>
            <li>Assinaturas e despesas recorrentes (descrição, valor, frequência)</li>
            <li>Anotações e descrições relacionadas a transações financeiras</li>
          </ul>
          <p className="text-muted-foreground font-semibold mt-2">
            ⚠️ IMPORTANTE: Seus dados financeiros são armazenados localmente no navegador e não são transmitidos 
            para nossos servidores. Temos acesso zero aos seus dados financeiros.
          </p>

          <h3 className="text-base font-semibold text-foreground mt-3">2.3. Dados Técnicos</h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
            <li>Endereço IP</li>
            <li>Tipo de navegador e versão</li>
            <li>Sistema operacional</li>
            <li>Resolução de tela</li>
            <li>Páginas visitadas e tempo de permanência</li>
            <li>Data e hora de acesso</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">3. Base Legal (LGPD)</h2>
          <p className="text-muted-foreground">
            Processamos seus dados pessoais com base nas seguintes bases legais previstas na LGPD:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>
              <span className="font-semibold">Consentimento (Art. 7º, I):</span> Ao aceitar esta Política de Privacidade, 
              você consente o tratamento de seus dados
            </li>
            <li>
              <span className="font-semibold">Execução de Contrato (Art. 7º, V):</span> Necessário para fornecer os 
              serviços do Aplicativo
            </li>
            <li>
              <span className="font-semibold">Legítimo Interesse (Art. 7º, IX):</span> Para melhorar e personalizar 
              sua experiência
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">4. Como Usamos Seus Dados</h2>
          <p className="text-muted-foreground">
            Utilizamos suas informações para:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
            <li>Autenticar e gerenciar sua conta de usuário</li>
            <li>Fornecer as funcionalidades do Aplicativo de controle financeiro</li>
            <li>Sincronizar seus dados entre dispositivos através do User ID</li>
            <li>Enviar notificações importantes sobre o serviço (quando aplicável)</li>
            <li>Analisar o uso do Aplicativo para melhorias (dados agregados e anonimizados)</li>
            <li>Detectar e prevenir fraudes ou uso indevido</li>
            <li>Cumprir obrigações legais</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">5. Armazenamento e Segurança</h2>
          
          <h3 className="text-base font-semibold text-foreground mt-3">5.1. Armazenamento Local (LocalStorage)</h3>
          <p className="text-muted-foreground">
            Seus dados financeiros são armazenados localmente no navegador através do <span className="font-semibold">localStorage</span>, 
            vinculados ao seu User ID. Isso significa:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
            <li>Os dados permanecem em seu dispositivo</li>
            <li>Não são transmitidos para servidores externos (exceto autenticação)</li>
            <li>Você tem controle total sobre seus dados</li>
            <li>Limpar o cache do navegador apagará seus dados locais</li>
          </ul>

          <h3 className="text-base font-semibold text-foreground mt-3">5.2. Dados de Autenticação (Clerk)</h3>
          <p className="text-muted-foreground">
            Os dados de autenticação (nome, e-mail, User ID) são gerenciados pelo <span className="font-semibold">Clerk</span>, 
            um serviço certificado e em conformidade com GDPR/LGPD. Clerk utiliza:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
            <li>Criptografia TLS/SSL para transmissão de dados</li>
            <li>Criptografia de dados em repouso</li>
            <li>Autenticação multifator (quando habilitada)</li>
            <li>Proteção contra ataques comuns (XSS, CSRF, SQL Injection)</li>
          </ul>

          <h3 className="text-base font-semibold text-foreground mt-3">5.3. Medidas de Segurança</h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
            <li>Uso de HTTPS em todas as comunicações</li>
            <li>Segregação de dados por usuário (isolamento completo)</li>
            <li>Tokens de sessão seguros e temporários</li>
            <li>Monitoramento de atividades suspeitas</li>
            <li>Backups regulares da infraestrutura</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">6. Compartilhamento de Dados</h2>
          <p className="text-muted-foreground font-semibold">
            NÃO vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins comerciais.
          </p>
          <p className="text-muted-foreground">
            Compartilhamos dados apenas com:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>
              <span className="font-semibold">Clerk (Autenticação):</span> Para gerenciamento de contas e autenticação segura
            </li>
            <li>
              <span className="font-semibold">Vercel (Hospedagem):</span> Para hospedar e servir o Aplicativo
            </li>
            <li>
              <span className="font-semibold">Vercel Analytics:</span> Para métricas de uso agregadas e anônimas
            </li>
          </ul>
          <p className="text-muted-foreground mt-2">
            Todos os provedores terceiros são obrigados contratualmente a proteger seus dados e usá-los apenas 
            para os fins especificados.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">7. Retenção de Dados</h2>
          <p className="text-muted-foreground">
            Mantemos seus dados enquanto:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
            <li>Sua conta estiver ativa</li>
            <li>For necessário para fornecer os serviços</li>
            <li>For exigido por lei ou regulamentação</li>
            <li>Para resolver disputas ou fazer cumprir acordos</li>
          </ul>
          <p className="text-muted-foreground mt-2">
            Após a exclusão da conta, seus dados de autenticação serão removidos dentro de 90 dias. 
            Dados financeiros locais (localStorage) são excluídos imediatamente do navegador.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">8. Seus Direitos (LGPD)</h2>
          <p className="text-muted-foreground">
            De acordo com a LGPD, você tem os seguintes direitos sobre seus dados pessoais:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>
              <span className="font-semibold">Acesso (Art. 18, I e II):</span> Confirmar se tratamos seus dados e acessá-los
            </li>
            <li>
              <span className="font-semibold">Correção (Art. 18, III):</span> Corrigir dados incompletos, inexatos ou desatualizados
            </li>
            <li>
              <span className="font-semibold">Anonimização/Bloqueio (Art. 18, IV):</span> Solicitar anonimização ou bloqueio
            </li>
            <li>
              <span className="font-semibold">Eliminação (Art. 18, VI):</span> Solicitar exclusão de dados desnecessários
            </li>
            <li>
              <span className="font-semibold">Portabilidade (Art. 18, V):</span> Solicitar transferência de dados para outro fornecedor
            </li>
            <li>
              <span className="font-semibold">Revogação do Consentimento (Art. 18, IX):</span> Retirar seu consentimento a qualquer momento
            </li>
            <li>
              <span className="font-semibold">Oposição (Art. 18, § 2º):</span> Opor-se ao tratamento em determinadas situações
            </li>
          </ul>
          <p className="text-muted-foreground mt-3 font-semibold">
            Para exercer qualquer desses direitos, entre em contato através dos canais oficiais. 
            Responderemos em até 15 dias úteis.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">9. Cookies e Tecnologias Similares</h2>
          <p className="text-muted-foreground">
            Utilizamos as seguintes tecnologias:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
            <li><span className="font-semibold">Cookies de Sessão:</span> Para manter você autenticado</li>
            <li><span className="font-semibold">LocalStorage:</span> Para armazenar dados financeiros localmente</li>
            <li><span className="font-semibold">Cookies Analíticos:</span> Para entender como você usa o Aplicativo (Vercel Analytics)</li>
          </ul>
          <p className="text-muted-foreground mt-2">
            Você pode desabilitar cookies nas configurações do navegador, mas isso pode afetar a funcionalidade do Aplicativo.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">10. Transferência Internacional de Dados</h2>
          <p className="text-muted-foreground">
            Alguns de nossos provedores de serviço (Clerk, Vercel) podem armazenar dados em servidores localizados 
            fora do Brasil. Garantimos que essas transferências estão em conformidade com a LGPD e que medidas 
            adequadas de proteção estão implementadas.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">11. Menores de Idade</h2>
          <p className="text-muted-foreground">
            Este Aplicativo não é destinado a menores de 18 anos. Não coletamos intencionalmente dados de menores. 
            Se descobrirmos que coletamos dados de um menor sem consentimento dos pais/responsáveis, tomaremos 
            medidas para excluir essas informações.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">12. Violações de Dados</h2>
          <p className="text-muted-foreground">
            Em caso de incidente de segurança que possa gerar risco aos seus direitos e liberdades, notificaremos 
            você e a Autoridade Nacional de Proteção de Dados (ANPD) dentro do prazo legal estabelecido pela LGPD.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">13. Alterações nesta Política</h2>
          <p className="text-muted-foreground">
            Podemos atualizar esta Política de Privacidade periodicamente para refletir mudanças em nossas práticas 
            ou por razões legais. Notificaremos você sobre alterações significativas através do Aplicativo ou por e-mail. 
            A data da "Última atualização" no topo desta política indica quando foi modificada pela última vez.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">14. Encarregado de Dados (DPO)</h2>
          <p className="text-muted-foreground">
            Nosso Encarregado de Proteção de Dados (DPO) está disponível para esclarecer dúvidas e receber 
            solicitações relacionadas aos seus dados pessoais através dos canais oficiais do 
            <span className="font-semibold"> Meu Controle Financeiro</span>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">15. Contato</h2>
          <p className="text-muted-foreground">
            Para questões sobre privacidade, exercer seus direitos ou reportar preocupações, entre em contato 
            através dos canais oficiais ou envie uma solicitação formal ao DPO.
          </p>
        </section>

        <section className="space-y-3 border-t pt-4">
          <p className="text-xs text-muted-foreground italic">
            Ao utilizar este Aplicativo, você declara ter lido, compreendido e concordado com esta Política de 
            Privacidade e com o tratamento de seus dados pessoais conforme descrito.
          </p>
          <p className="text-xs text-muted-foreground italic font-semibold mt-2">
            Sua privacidade é nossa prioridade. Trabalhamos constantemente para proteger seus dados pessoais 
            e financeiros.
          </p>
        </section>
      </div>
  )
}
