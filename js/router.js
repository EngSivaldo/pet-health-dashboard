// js/router.js
const Router = {
  go(pageId) {
    console.log("Navegando para:", pageId);
    // Esconde todas as páginas que tenham a classe 'app-page'
    document
      .querySelectorAll(".app-page")
      .forEach((p) => p.classList.add("hidden"));

    // Mostra a página solicitada
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
      // ... dentro do if(targetPage)
      targetPage.classList.remove("hidden");
      targetPage.style.opacity = "0";
      setTimeout(() => {
        targetPage.style.opacity = "1";
      }, 50);
      window.scrollTo(0, 0);
    }

    // Gatilhos automáticos ao entrar em uma página
    if (pageId === "dashboard" && typeof Dashboard !== "undefined") {
      Dashboard.load();
    }
  },
};
