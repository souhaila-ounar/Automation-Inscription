export function generateFallBackEmailContent({
  subjects,
  isFeminine,
  adminName,
  clientFirstName,
}: {
  subjects: string[];
  isFeminine: boolean;
  adminName: string;
  clientFirstName: string;
}) {
  const subjectText = subjects.join(" et ");
  const ouvertOuOuverte = isFeminine ? "ouverte" : "ouvert";
  const cetteCes = subjects.length > 1 ? "ces matières" : "cette matière";

  return `
  <p>Bonjour ${clientFirstName},</p>
<p>
  Je vous écris afin de faire suite à votre demande pour un tuteur en présentiel
  en ${subjectText} de.
</p>

<p>
  Notre équipe a contacté tous les tuteurs qualifiés à proximité de votre
  secteur pour ${cetteCes}, mais
  malheureusement, aucun d'entre eux n'a actuellement de disponibilité pour
  ajouter un nouvel élève à leur horaire.
</p>

<p>
  Comme vous aviez indiqué, lors de votre demande, que vous étiez ${ouvertOuOuverte}, à passer à des séances en ligne si
  nous ne trouvions pas de tuteur en présentiel dans un délai de 7 jours, j'ai
  procédé à cette modification à votre dossier. En éliminant les contraintes de
  distance et de déplacement, cela nous permettra d'élargir les profils de
  tuteurs qui peuvent vous aider et ainsi d'accélérer la recherche.
</p>

<p>
  N'hésitez pas à me contacter si vous avez des questions ou souhaitez obtenir
  des précisions.
</p>

<p>Cordialement,</p>

<div>
  <span style="color: #555555; font-size: 17px">
    <strong> ${adminName} </strong>
  </span>
</div>

<div>
  <span style="font-size: 14px">gestionnaire de comptes / Account Manager</span>
</div>
<div></div>
<div>
  <img
    src="https://tutorcruncher-public.s3.amazonaws.com/tutorax/Tutorax-logo-grey.png"
    alt=""
    width="208"
    height="41"
  />
</div>
<div></div>
<div><span style="font-size: 14px">Tutorax Inc.</span></div>
<div>
  <span style="font-size: 12px"
    >4969 Rue Ambroise-Lafortune, Boisbriand, QC J7H 0A4</span
  >
</div>
<div>
  <span style="font-size: 12px">Tel. : 1(800) 513-5358 | (514) 548-3242</span>
</div>
<div>
  <span style="font-size: 13px"
    ><a href="http://www.tutorax.com/">www.tutorax.com</a></span
  >
</div>

  `;
}
