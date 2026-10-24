import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = { title: "Termos de uso" };

export default function TermsPage() {
  const email = <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>;

  return (
    <LegalPage title="Termos de uso" updatedAt={LEGAL.termsUpdatedAt}>
      <section>
        <h2>1. O que é o {LEGAL.productName}</h2>
        <p>
          O {LEGAL.productName} é um diário pessoal de jogos: biblioteca, progresso, troféus, reviews e memórias. É um
          projeto pessoal, gratuito e sem fins comerciais, mantido por {LEGAL.author} ({LEGAL.handle}), pessoa física.
          Não existe empresa, plano pago ou equipe de suporte por trás dele.
        </p>
        <p>
          Ao criar uma conta ou usar o serviço, você concorda com estes termos e com a{" "}
          <Link href="/privacidade">Política de privacidade</Link>.
        </p>
      </section>

      <section>
        <h2>2. Conta e acesso</h2>
        <ul>
          <li>O acesso é feito por link enviado ao seu e-mail. Quem controla o seu e-mail controla a sua conta.</li>
          <li>Se você tem menos de 18 anos, use o serviço com o conhecimento de um responsável.</li>
          <li>Você pode pedir a exclusão da sua conta a qualquer momento pelo e-mail {email}.</li>
        </ul>
      </section>

      <section>
        <h2>3. O seu conteúdo</h2>
        <ul>
          <li>
            Reviews, registros de diário, screenshots, artes e demais conteúdos que você cria continuam sendo seus.
          </li>
          <li>
            Você autoriza o serviço apenas a guardar e exibir esse conteúdo conforme as suas configurações de
            visibilidade (privado ou público). Nada é vendido, licenciado a terceiros ou usado para publicidade.
          </li>
          <li>
            Você só deve enviar imagens e textos que tem direito de usar. Não é permitido publicar conteúdo ilegal, que
            viole direitos de terceiros, discriminatório ou que exponha dados pessoais de outras pessoas.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Dados de jogos</h2>
        <p>
          Nomes, capas e informações dos jogos vêm do <a href="https://www.igdb.com">IGDB.com</a> e pertencem aos
          respectivos donos. O {LEGAL.productName} não se conecta às suas contas em lojas ou plataformas de jogos.
        </p>
      </section>

      <section>
        <h2>5. Marcas e afiliação</h2>
        <p>
          O {LEGAL.productName} não tem afiliação, patrocínio ou aprovação da Sony Interactive Entertainment,
          PlayStation, Nintendo, Microsoft, Valve, IGDB, Twitch ou das publishers dos jogos. Nomes de plataformas e de
          jogos, logos e capas são marcas ou obras dos respectivos donos e aparecem apenas para identificar os jogos da
          sua biblioteca.
        </p>
      </section>

      <section>
        <h2>6. Uso não permitido</h2>
        <ul>
          <li>Revender, cobrar pelo acesso ou usar o serviço ou o seu código para fins comerciais.</li>
          <li>
            Tentar acessar dados de outras pessoas, sobrecarregar o serviço ou coletar dados de forma automatizada.
          </li>
          <li>Usar o serviço para qualquer atividade ilegal.</li>
        </ul>
      </section>

      <section>
        <h2>7. Remoção de conteúdo</h2>
        <p>
          Se algum conteúdo exibido no serviço viola direitos seus (por exemplo, uma imagem de sua autoria), escreva
          para {email} com o link do conteúdo e a explicação. O pedido é analisado e, se procedente, o conteúdo é
          removido o quanto antes.
        </p>
      </section>

      <section>
        <h2>8. Disponibilidade e responsabilidade</h2>
        <p>
          Por ser um projeto pessoal, o serviço é oferecido como está, sem garantia de disponibilidade contínua, de
          ausência de erros ou de que integrações de terceiros continuem funcionando. Na extensão permitida pela lei, o
          mantenedor não se responsabiliza por perdas decorrentes do uso. Recomendamos exportar periodicamente o que for
          importante para você.
        </p>
      </section>

      <section>
        <h2>9. Encerramento</h2>
        <p>
          O mantenedor pode suspender contas que violem estes termos. Se o serviço for encerrado, os usuários serão
          avisados com pelo menos 30 dias de antecedência, sempre que possível, para que possam exportar seus dados.
        </p>
      </section>

      <section>
        <h2>10. Código-fonte</h2>
        <p>
          O código do {LEGAL.productName} é distribuído sob a licença <a href={LEGAL.licenseUrl}>{LEGAL.licenseName}</a>
          , que permite uso pessoal e não comercial com crédito ao autor. Para uso comercial, solicite uma licença pelo{" "}
          <a href={LEGAL.commercialLicenseUrl}>formulário</a>.
        </p>
      </section>

      <section>
        <h2>11. Alterações e lei aplicável</h2>
        <p>
          Estes termos podem ser atualizados. Mudanças relevantes serão avisadas no próprio serviço. Estes termos seguem
          a legislação brasileira, incluindo o Marco Civil da Internet e o Código de Defesa do Consumidor, quando
          aplicável.
        </p>
      </section>

      <section>
        <h2>12. Contato</h2>
        <p>Dúvidas, pedidos e reclamações: {email}.</p>
      </section>
    </LegalPage>
  );
}
