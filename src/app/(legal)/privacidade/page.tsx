import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = { title: "Política de privacidade" };

export default function PrivacyPage() {
  const email = <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>;

  return (
    <LegalPage title="Política de privacidade" updatedAt={LEGAL.privacyUpdatedAt}>
      <section>
        <p>
          Esta política explica quais dados o {LEGAL.productName} guarda, por quê e como você controla isso, conforme a
          Lei Geral de Proteção de Dados (Lei nº 13.709/2018, LGPD).
        </p>
      </section>

      <section>
        <h2>1. Quem é o responsável</h2>
        <p>
          O controlador dos dados é {LEGAL.author} ({LEGAL.handle}), pessoa física que mantém o serviço. Contato para
          qualquer assunto de privacidade, inclusive como encarregado: {email}.
        </p>
      </section>

      <section>
        <h2>2. Dados que guardamos</h2>
        <ul>
          <li>
            <strong>Conta:</strong> seu e-mail, usado para o login por link.
          </li>
          <li>
            <strong>Perfil:</strong> nome de usuário, nome de exibição, bio, avatar, banner, fundo e preferências de
            aparência, se você preencher.
          </li>
          <li>
            <strong>Seu conteúdo:</strong> biblioteca, status, posse, notas, jornadas com datas, reviews, registros de
            diário, screenshots e artes que você enviar.
          </li>
          <li>
            <strong>Registros técnicos:</strong> a hospedagem registra dados como endereço IP e horário de acesso para
            segurança e funcionamento.
          </li>
        </ul>
        <p>
          Não usamos senha, ferramentas de análise, publicidade, rastreamento entre sites nem vendemos dados. Os únicos
          cookies são os de sessão, necessários para manter você conectado.
        </p>
      </section>

      <section>
        <h2>3. Para que usamos e com qual base legal</h2>
        <ul>
          <li>
            Oferecer o serviço que você pediu: guardar e exibir a sua biblioteca e o seu diário (execução de contrato,
            art. 7º, V).
          </li>
          <li>Manter a segurança e prevenir abusos (legítimo interesse, art. 7º, IX).</li>
        </ul>
      </section>

      <section>
        <h2>4. Quem mais tem acesso</h2>
        <p>Os dados são processados por serviços que fazem o {LEGAL.productName} funcionar:</p>
        <ul>
          <li>
            <strong>Supabase:</strong> banco de dados, login e armazenamento de imagens.
          </li>
          <li>
            <strong>Vercel:</strong> hospedagem do site.
          </li>
          <li>
            <strong>IGDB / Twitch:</strong> recebe apenas os termos de busca de jogos, sem dados pessoais.
          </li>
        </ul>
        <p>
          Esses serviços podem armazenar dados fora do Brasil. A transferência internacional ocorre para executar o
          serviço que você usa (art. 33 da LGPD).
        </p>
      </section>

      <section>
        <h2>5. O que fica público</h2>
        <p>
          Seu perfil começa privado. Se você o tornar público, outras pessoas podem ver seu nome de usuário, bio, jogos,
          platinas e jornadas. Reviews, registros de diário e screenshots marcados como privados nunca aparecem para
          ninguém além de você.
        </p>
      </section>

      <section>
        <h2>6. Por quanto tempo</h2>
        <p>
          Os dados ficam guardados enquanto sua conta existir. Ao pedir a exclusão, tudo é apagado em até 30 dias,
          exceto o que a lei obrigar a manter. Registros técnicos seguem os prazos dos provedores de hospedagem.
        </p>
      </section>

      <section>
        <h2>7. Seus direitos</h2>
        <p>Você pode, a qualquer momento:</p>
        <ul>
          <li>confirmar quais dados existem e acessá-los;</li>
          <li>corrigir dados incompletos ou errados;</li>
          <li>receber uma cópia dos seus dados (portabilidade);</li>
          <li>pedir a exclusão da conta e de todo o conteúdo;</li>
        </ul>
        <p>
          Enquanto a exportação e a exclusão não estão disponíveis direto no app, basta pedir por {email}. A resposta
          sai em até 15 dias. Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).
        </p>
      </section>

      <section>
        <h2>8. Segurança</h2>
        <p>
          O acesso aos dados é restrito por usuário diretamente no banco, a conexão é sempre criptografada (HTTPS) e
          chaves de serviços ficam apenas no servidor. Nenhum sistema é 100% seguro: se houver um incidente que afete
          seus dados, você será avisado.
        </p>
      </section>

      <section>
        <h2>9. Alterações</h2>
        <p>Esta política pode mudar. Mudanças relevantes serão avisadas no próprio serviço antes de valerem.</p>
      </section>
    </LegalPage>
  );
}
