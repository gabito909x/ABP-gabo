// Interacciones del proyecto de vida.
(function () {
  "use strict";

  document.documentElement.classList.add("js-activo");

  // ==========================================================================
  // LOADER DE ENTRADA
  // ==========================================================================
  const loader = document.getElementById("loader");
  if (loader) {
    // Ocultar después de 2.2 segundos
    setTimeout(function () {
      loader.classList.add("oculto");
      // Eliminar del DOM después de la transición
      setTimeout(function () { loader.remove(); }, 600);
    }, 2200);
  }

  // ==========================================================================
  // BARRA DE PROGRESO DE SCROLL
  // ==========================================================================
  const barraProgreso = document.getElementById("barra-progreso");
  if (barraProgreso) {
    let ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progreso = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        barraProgreso.style.width = progreso + "%";
        ticking = false;
      });
    }, { passive: true });
  }

  // ==========================================================================
  // THEME TOGGLE (modo oscuro/claro)
  // ==========================================================================
  const themeToggle = document.querySelector(".theme-toggle");
  if (themeToggle) {
    // Cargar preferencia guardada
    const temaGuardado = localStorage.getItem("tema");
    if (temaGuardado === "claro") {
      document.body.classList.add("tema-claro");
      themeToggle.textContent = "○";
    }
    themeToggle.addEventListener("click", function () {
      const esClaro = document.body.classList.toggle("tema-claro");
      themeToggle.textContent = esClaro ? "○" : "◐";
      localStorage.setItem("tema", esClaro ? "claro" : "oscuro");
    });
  }

  // ==========================================================================
  // FONDO: PARTÍCULAS MAGNÉTICAS (siguen el mouse)
  // ==========================================================================
  const canvas = document.querySelector("#fondo-particulas");
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    function esTemaClaro() { return document.body.classList.contains("tema-claro"); }
    const particulas = [];
    let ancho = 0, alto = 0, escala = 1, cursor = null, marco = 0, visible = !document.hidden, ultimoTiempo = 0;
    const NUM_PARTICULAS = 180;
    const RADIO_ATRACCION = 180;
    const RADIO_REPULSION = 60;

    function crearParticula() {
      return {
        x: Math.random() * ancho,
        y: Math.random() * alto,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radio: Math.random() * 1.5 + 0.5,
        intensidad: 0,
      };
    }

    function redimensionar() {
      escala = Math.min(window.devicePixelRatio || 1, 2);
      ancho = window.innerWidth;
      alto = window.innerHeight;
      canvas.width = Math.round(ancho * escala);
      canvas.height = Math.round(alto * escala);
      ctx.setTransform(escala, 0, 0, escala, 0, 0);
      particulas.length = 0;
      for (let i = 0; i < NUM_PARTICULAS; i++) particulas.push(crearParticula());
    }

    function dibujar(tiempo) {
      marco = 0;
      if (!visible) return;
      const factor = ultimoTiempo ? 1 - Math.exp(-(tiempo - ultimoTiempo) / 120) : 1;
      ultimoTiempo = tiempo;
      ctx.clearRect(0, 0, ancho, alto);

      let sigueAnimando = false;

      particulas.forEach(function (p) {
        // Movimiento base
        p.x += p.vx;
        p.y += p.vy;

        // Rebotar en bordes
        if (p.x < 0 || p.x > ancho) p.vx *= -1;
        if (p.y < 0 || p.y > alto) p.vy *= -1;
        p.x = Math.max(0, Math.min(ancho, p.x));
        p.y = Math.max(0, Math.min(alto, p.y));

        // Interacción con cursor
        let objetivo = 0;
        if (cursor && !reduceMotion.matches && finePointer.matches) {
          const dx = cursor.x - p.x;
          const dy = cursor.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < RADIO_ATRACCION) {
            objetivo = 1 - dist / RADIO_ATRACCION;
            // Atracción suave
            if (dist > RADIO_REPULSION) {
              p.vx += dx * 0.00008;
              p.vy += dy * 0.00008;
            } else {
              // Repulsión cercana
              p.vx -= dx * 0.0003;
              p.vy -= dy * 0.0003;
            }
          }
        }
        // Amortiguación
        p.vx *= 0.99;
        p.vy *= 0.99;
        // Limitar velocidad
        const vel = Math.hypot(p.vx, p.vy);
        if (vel > 1.5) { p.vx = (p.vx / vel) * 1.5; p.vy = (p.vy / vel) * 1.5; }

        p.intensidad += (objetivo - p.intensidad) * factor;
        if (Math.abs(objetivo - p.intensidad) > 0.003) sigueAnimando = true;

        // Dibujar
        const radio = p.radio + p.intensidad * 3.5;
        const alpha = 0.25 + p.intensidad * 0.7;
        // Color: adaptado al tema
        let baseR, baseG, baseB, activoR, activoG, activoB;
        if (esTemaClaro()) {
          baseR = 28; baseG = 23; baseB = 18; activoR = 184; activoG = 92; activoB = 42;
        } else {
          baseR = 100; baseG = 116; baseB = 139; activoR = 59; activoG = 130; activoB = 246;
        }
        const r = Math.round(baseR + (activoR - baseR) * p.intensidad);
        const g = Math.round(baseG + (activoG - baseG) * p.intensidad);
        const b = Math.round(baseB + (activoB - baseB) * p.intensidad);
        ctx.beginPath();
        ctx.arc(p.x, p.y, radio, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
        ctx.fill();

        // Conexiones entre partículas cercanas
        if (p.intensidad > 0.3) {
          particulas.forEach(function (p2) {
            if (p2 === p) return;
            const d = Math.hypot(p.x - p2.x, p.y - p2.y);
            if (d < 80 && p2.intensidad > 0.1) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              const lineColor = esTemaClaro() ? "184, 92, 42" : "59, 130, 246";
              ctx.strokeStyle = "rgba(" + lineColor + ", " + (0.3 * p.intensidad * p2.intensidad) + ")";
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          });
        }
      });

      if (sigueAnimando || (cursor && !reduceMotion.matches && finePointer.matches)) {
        marco = window.requestAnimationFrame(dibujar);
      } else {
        ultimoTiempo = 0;
      }
    }

    function solicitarDibujo() {
      if (visible && !marco) marco = window.requestAnimationFrame(dibujar);
    }

    window.addEventListener("pointermove", function (evento) {
      if (evento.pointerType !== "mouse" || reduceMotion.matches || !finePointer.matches) return;
      cursor = { x: evento.clientX, y: evento.clientY };
      solicitarDibujo();
    });
    window.addEventListener("pointerleave", function () { cursor = null; solicitarDibujo(); });
    window.addEventListener("resize", redimensionar);
    document.addEventListener("visibilitychange", function () {
      visible = !document.hidden;
      if (!visible && marco) { window.cancelAnimationFrame(marco); marco = 0; }
      else { solicitarDibujo(); }
    });
    reduceMotion.addEventListener("change", function () { if (reduceMotion.matches) cursor = null; solicitarDibujo(); });
    finePointer.addEventListener("change", function () { if (!finePointer.matches) cursor = null; solicitarDibujo(); });

    redimensionar();
    solicitarDibujo();
  }

  // ==========================================================================
  // TERMINAL HERO (momento wow)
  // ==========================================================================
  const terminalTexto = document.getElementById("terminal-texto");
  if (terminalTexto) {
    const lineas = [
      "$ git init proyecto-de-vida",
      "$ cd gabriel && npm run soñar",
      "> Graduarme Técnico el 27 de noviembre",
      "> Inscribirme al Tecnólogo ADSO en 2027",
      "> Graduarme Ingeniero de Software en EAM",
      "> Trabajar remoto para empresa en EE.UU.",
      "> Especializarme en UX/UI, IA o ciberseguridad",
      "$ echo \"El que no sueña nunca progresa.\"",
    ];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let indiceLinea = 0, indiceChar = 0, escribiendo = true;

    function escribir() {
      if (reduceMotion.matches) { terminalTexto.textContent = lineas[lineas.length - 1]; return; }
      if (indiceLinea >= lineas.length) {
        setTimeout(function () { terminalTexto.textContent = ""; indiceLinea = 0; indiceChar = 0; escribiendo = true; escribir(); }, 2500);
        return;
      }
      const lineaActual = lineas[indiceLinea];
      if (escribiendo) {
        if (indiceChar < lineaActual.length) { terminalTexto.textContent = lineaActual.substring(0, indiceChar + 1); indiceChar++; setTimeout(escribir, 45); }
        else { escribiendo = false; setTimeout(escribir, 900); }
      } else {
        terminalTexto.textContent = ""; indiceLinea++; indiceChar = 0; escribiendo = true; setTimeout(escribir, 200);
      }
    }
    if ("IntersectionObserver" in window) {
      const hero = document.getElementById("inicio");
      const obs = new IntersectionObserver(function (entradas) { entradas.forEach(function (e) { if (e.isIntersecting) { obs.unobserve(e.target); setTimeout(escribir, 600); } }); }, { threshold: 0.3 });
      if (hero) obs.observe(hero);
    } else { setTimeout(escribir, 800); }
  }

  // ==========================================================================
  // REVEAL AL SCROLL
  // ==========================================================================
  if ("IntersectionObserver" in window) {
    const observador = new IntersectionObserver(function (entradas, observer) {
      entradas.forEach(function (entrada) { if (entrada.isIntersecting) { entrada.target.classList.add("visible"); observer.unobserve(entrada.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll(".seccion, .portada, .carrera-card, .perfil-grid article, .realidad-grid article, .meta, .programador-card, .primer-paso, .demo-hola, .demo-typewriter, .ruta-acad-card").forEach(function (elemento) {
      elemento.classList.add("revelar"); observador.observe(elemento);
    });
  }

  // ==========================================================================
  // TEXTOS CENTRALIZADOS
  // ==========================================================================
  const textos = window.PROYECTO_TEXTOS;
  if (textos) {
    const campos = { bioIntro: textos.quienSoy.introduccion, bioStory: textos.quienSoy.historia, bioInterests: textos.quienSoy.intereses, bioStrengths: textos.quienSoy.cualidades, bioUnique: textos.quienSoy.unico };
    Object.keys(campos).forEach(function (clave) { const nodo = document.querySelector('[data-text="' + clave + '"]'); if (nodo) nodo.textContent = campos[clave]; });
    function sincronizarTextos(selector, lista) { document.querySelectorAll(selector).forEach(function (nodo, indice) { if (lista[indice] !== undefined) nodo.textContent = lista[indice]; }); }
    sincronizarTextos(".carrera-card p", textos.carrera.tarjetas);
    sincronizarTextos(".flip-cara.respuesta > span:last-child", textos.porQue.map(function (item) { return item.respuesta; }));
    sincronizarTextos(".meta-uno .meta-detalle li", textos.camino.corto);
    sincronizarTextos(".meta-dos .meta-detalle li", textos.camino.mediano);
    sincronizarTextos(".realidad-grid article p", textos.realidad.tarjetas);
    sincronizarTextos(".sueño p", textos.futuro.sueños);
    const metaLarga = document.querySelector(".meta-tres .meta-detalle p");
    if (metaLarga) metaLarga.textContent = textos.camino.largo[0];
  }

  // ==========================================================================
  // TARJETA 3D (drag)
  // ==========================================================================
  const tarjeta = document.querySelector(".tarjeta-identidad");
  if (tarjeta) {
    let inicioX = 0, inicioY = 0;
    tarjeta.addEventListener("pointerdown", function (evento) { inicioX = evento.clientX; inicioY = evento.clientY; tarjeta.setPointerCapture(evento.pointerId); tarjeta.classList.add("girando"); });
    tarjeta.addEventListener("pointermove", function (evento) {
      if (!tarjeta.classList.contains("girando")) return;
      const giroY = Math.max(-18, Math.min(18, (evento.clientX - inicioX) / 5));
      const giroX = Math.max(-14, Math.min(14, (inicioY - evento.clientY) / 6));
      tarjeta.style.transform = "perspective(900px) rotateY(" + giroY + "deg) rotateX(" + giroX + "deg)";
    });
    function reiniciarGiro() { tarjeta.classList.remove("girando"); tarjeta.style.transform = ""; }
    tarjeta.addEventListener("pointerup", reiniciarGiro);
    tarjeta.addEventListener("pointercancel", reiniciarGiro);
    tarjeta.addEventListener("keydown", function (evento) { if (evento.key === "Enter" || evento.key === " ") { evento.preventDefault(); tarjeta.classList.toggle("enfoque-giro"); } });
  }

  // ==========================================================================
  // CARRUSEL HORIZONTAL
  // ==========================================================================
  const carrusel = document.querySelector(".carrusel");
  if (carrusel) {
    let arrastrando = false, xInicio = 0, scrollInicio = 0;
    carrusel.addEventListener("pointerdown", function (evento) { if (evento.pointerType === "mouse" && evento.button !== 0) return; arrastrando = true; xInicio = evento.clientX; scrollInicio = carrusel.scrollLeft; carrusel.classList.add("arrastrando"); });
    carrusel.addEventListener("pointermove", function (evento) { if (!arrastrando) return; carrusel.scrollLeft = scrollInicio - (evento.clientX - xInicio); });
    function soltarCarrusel() { arrastrando = false; carrusel.classList.remove("arrastrando"); }
    carrusel.addEventListener("pointerup", soltarCarrusel);
    carrusel.addEventListener("pointercancel", soltarCarrusel);
    carrusel.addEventListener("pointerleave", soltarCarrusel);
  }

  // ==========================================================================
  // FLIP CARDS
  // ==========================================================================
  document.querySelectorAll(".flip-card").forEach(function (boton) {
    boton.addEventListener("click", function () { const volteada = boton.classList.toggle("volteada"); boton.setAttribute("aria-pressed", String(volteada)); });
  });

  // ==========================================================================
  // SECCIÓN ACTIVA EN NAVEGACIÓN
  // ==========================================================================
  const enlacesNavegacion = document.querySelectorAll('.navegacion a[href^="#"]');
  const seccionesNavegacion = Array.from(enlacesNavegacion).map(function (enlace) { return document.querySelector(enlace.getAttribute('href')); }).filter(Boolean);
  if (enlacesNavegacion.length && seccionesNavegacion.length) {
    function actualizarSeccionActiva() {
      const margen = window.innerHeight * 0.35;
      let seccionActiva = 'inicio';
      seccionesNavegacion.forEach(function (seccion) { if (window.scrollY + margen >= seccion.offsetTop) { seccionActiva = seccion.id; } });
      enlacesNavegacion.forEach(function (enlace) {
        const activo = enlace.getAttribute('href') === '#' + seccionActiva;
        enlace.classList.toggle('actual', activo);
        if (activo) enlace.setAttribute('aria-current', 'location'); else enlace.removeAttribute('aria-current');
      });
    }
    window.addEventListener('scroll', actualizarSeccionActiva, { passive: true });
    window.addEventListener('load', actualizarSeccionActiva);
    actualizarSeccionActiva();
  }

  // ==========================================================================
  // METAS (accordion) + LÍNEA DE PROGRESO
  // ==========================================================================
  document.querySelectorAll(".meta-cabecera").forEach(function (boton) {
    boton.addEventListener("click", function () { const meta = boton.closest(".meta"); const abierta = meta.classList.toggle("abierta"); boton.setAttribute("aria-expanded", String(abierta)); });
  });
  const linea = document.querySelector(".linea-tiempo");
  const progreso = document.querySelector(".linea-progreso");
  let esperandoMarco = false;
  function actualizarLinea() {
    if (!linea || !progreso) return;
    const rect = linea.getBoundingClientRect();
    const altura = Math.max(1, rect.height);
    const avance = Math.max(0, Math.min(1, (window.innerHeight * 0.72 - rect.top) / altura));
    progreso.style.height = (avance * 100) + "%";
    esperandoMarco = false;
  }
  window.addEventListener("scroll", function () { if (!esperandoMarco) { esperandoMarco = true; window.requestAnimationFrame(actualizarLinea); } }, { passive: true });
  actualizarLinea();

  // ==========================================================================
  // SALARIOS
  // ==========================================================================
  const salarios = textos && textos.salarios;
  document.querySelectorAll(".nivel").forEach(function (boton) {
    boton.addEventListener("click", function () {
      const nivel = boton.dataset.nivel;
      if (!salarios || !salarios[nivel]) return;
      document.querySelectorAll(".nivel").forEach(function (otro) { const seleccionado = otro === boton; otro.classList.toggle("activo", seleccionado); otro.setAttribute("aria-pressed", String(seleccionado)); });
      document.querySelector("[data-sueldo]").textContent = salarios[nivel].valor;
      document.querySelector(".barra-sueldo span").style.width = salarios[nivel].progreso;
    });
  });

  // ==========================================================================
  // TABLERO DE SUEÑOS (drag + zoom)
  // ==========================================================================
  document.querySelectorAll(".sueño").forEach(function (sueño) {
    let xInicial = 0, yInicial = 0, posicionX = 0, posicionY = 0, rotacionInicial = 0, desplazamientoX = 0, desplazamientoY = 0, rotacionFinal = 0, movio = false, movioAntes = false;
    sueño.addEventListener("pointerdown", function (evento) {
      xInicial = evento.clientX; yInicial = evento.clientY; posicionX = Number(sueño.dataset.x || 0); posicionY = Number(sueño.dataset.y || 0); rotacionInicial = Number(sueño.dataset.rotacion || 0); desplazamientoX = 0; desplazamientoY = 0; rotacionFinal = rotacionInicial; movio = false; movioAntes = false; sueño.setPointerCapture(evento.pointerId); sueño.classList.add("moviendo");
    });
    sueño.addEventListener("pointermove", function (evento) {
      if (!sueño.classList.contains("moviendo")) return;
      const dx = evento.clientX - xInicial, dy = evento.clientY - yInicial;
      if (Math.abs(dx) + Math.abs(dy) > 8) movio = true;
      if (!movio) return;
      movioAntes = true; desplazamientoX = dx; desplazamientoY = dy; rotacionFinal = rotacionInicial + Math.max(-4, Math.min(4, dx / 30));
      sueño.style.setProperty("--mover-x", (posicionX + dx) + "px"); sueño.style.setProperty("--mover-y", (posicionY + dy) + "px"); sueño.style.setProperty("--rotacion", rotacionFinal + "deg");
    });
    function terminarSueño() {
      if (!sueño.classList.contains("moviendo")) return;
      sueño.classList.remove("moviendo");
      if (movioAntes) { sueño.dataset.x = String(posicionX + desplazamientoX); sueño.dataset.y = String(posicionY + desplazamientoY); sueño.dataset.rotacion = String(rotacionFinal); }
      else { sueño.classList.toggle("zoom"); }
    }
    sueño.addEventListener("pointerup", terminarSueño);
    sueño.addEventListener("pointercancel", function () { sueño.classList.remove("moviendo"); });
    sueño.addEventListener("keydown", function (evento) { if (evento.key === "Enter" || evento.key === " ") { evento.preventDefault(); sueño.classList.toggle("zoom"); } });
  });

  // ==========================================================================
  // MENÚ MÓVIL
  // ==========================================================================
  const toggleMovil = document.querySelector(".menu-movil");
  const menuMovil = document.getElementById("menu-movil");
  if (toggleMovil && menuMovil) {
    toggleMovil.addEventListener("click", function () {
      const abierto = menuMovil.classList.toggle("abierto");
      toggleMovil.setAttribute("aria-expanded", String(abierto));
      toggleMovil.innerHTML = abierto ? 'CERRAR <span>✕</span>' : 'MENÚ <span>↘</span>';
    });
    menuMovil.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { menuMovil.classList.remove("abierto"); toggleMovil.setAttribute("aria-expanded", "false"); toggleMovil.innerHTML = 'MENÚ <span>↘</span>'; });
    });
  }

  // ==========================================================================
  // RUTA ACADÉMICA — LÍNEA DE TIEMPO INTERACTIVA
  // ==========================================================================
  const rutaTimeline = document.getElementById("ruta-timeline");
  const rutaProgreso = document.getElementById("ruta-timeline-progreso");
  if (rutaTimeline && rutaProgreso) {
    const etapas = rutaTimeline.querySelectorAll(".ruta-etapa");
    let rtTicking = false;
    function actualizarRutaTimeline() {
      const rect = rutaTimeline.getBoundingClientRect();
      const vh = window.innerHeight;
      const inicio = rect.top;
      const fin = rect.bottom;
      const total = fin - inicio;
      const avance = Math.max(0, Math.min(1, (vh * 0.6 - inicio) / total));
      rutaProgreso.style.height = (avance * 100) + "%";

      // Revelar etapas
      etapas.forEach(function (etapa) {
        const r = etapa.getBoundingClientRect();
        if (r.top < vh * 0.85) {
          etapa.classList.add("visible");
        }
      });
      rtTicking = false;
    }
    window.addEventListener("scroll", function () {
      if (!rtTicking) { rtTicking = true; requestAnimationFrame(actualizarRutaTimeline); }
    }, { passive: true });
    actualizarRutaTimeline();
  }

  // ==========================================================================
  // DEMO: HOLA MUNDO EN VIVO
  // ==========================================================================
  const demoEjecutar = document.getElementById("demo-ejecutar");
  const demoNombre = document.getElementById("demo-nombre");
  const demoResultado = document.getElementById("demo-resultado");
  if (demoEjecutar && demoNombre && demoResultado) {
    demoEjecutar.addEventListener("click", function () {
      const nombre = demoNombre.value.trim() || "mundo";
      demoResultado.innerHTML = '<span class="terminal-linea"><span class="terminal-prompt">$</span> saludar("' + nombre + '")</span><span class="terminal-linea terminal-comentario">// → "Hola, ' + nombre + '!"</span><span class="terminal-linea" style="color:#B85C2A;margin-top:8px;">Hola, ' + nombre + '!</span>';
    });
    demoNombre.addEventListener("keydown", function (e) { if (e.key === "Enter") demoEjecutar.click(); });
  }

  // ==========================================================================
  // DEMO: CÓDIGO QUE SE ESCRIBE SOLO
  // ==========================================================================
  const typewriterCode = document.getElementById("typewriter-code");
  const typewriterOutput = document.getElementById("typewriter-output");
  if (typewriterCode && typewriterOutput) {
    const codigo = 'function saludar(nombre) {\n  return "Hola, " + nombre;\n}\n\nconsole.log(saludar("Gabriel"));';
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let twIndex = 0, twStarted = false;
    function typeWriter() {
      if (reduceMotion.matches) { typewriterCode.querySelector("code").textContent = codigo; typewriterOutput.textContent = "Hola, Gabriel"; return; }
      if (twIndex < codigo.length) {
        typewriterCode.querySelector("code").textContent = codigo.substring(0, twIndex + 1);
        twIndex++;
        setTimeout(typeWriter, 30);
      } else {
        setTimeout(function () { typewriterOutput.textContent = "Hola, Gabriel"; typewriterOutput.style.color = "#B85C2A"; }, 500);
      }
    }
    if ("IntersectionObserver" in window) {
      const obs = new IntersectionObserver(function (entradas) { entradas.forEach(function (e) { if (e.isIntersecting && !twStarted) { twStarted = true; obs.unobserve(e.target); setTimeout(typeWriter, 400); } }); }, { threshold: 0.3 });
      obs.observe(typewriterCode);
    }
  }

  // ==========================================================================
  // ¿QUÉ HACE UN PROGRAMADOR? — tarjetas expansibles
  // ==========================================================================
  document.querySelectorAll(".programador-card").forEach(function (card) {
    card.addEventListener("click", function () {
      const demo = card.querySelector(".programador-demo");
      const abierto = card.classList.toggle("abierto");
      if (demo) demo.style.maxHeight = abierto ? demo.scrollHeight + "px" : "0px";
    });
  });
  // Demo "construir": botón cambia color
  const colorBtn = document.getElementById("demo-color-btn");
  const colorText = document.getElementById("demo-color-text");
  if (colorBtn && colorText) {
    const colores = ["#B85C2A", "#2E4A3D", "#1C1712", "#5E544A"];
    let ci = 0;
    colorBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      ci = (ci + 1) % colores.length;
      colorBtn.style.background = colores[ci];
      colorBtn.style.color = "#F4EFE4";
      colorText.textContent = "Color cambiado a " + colores[ci] + " con código.";
    });
  }
  // Demo "mejorar": barra de progreso
  const progressBar = document.getElementById("demo-progress");
  const progressLabel = document.getElementById("demo-progress-label");
  if (progressBar && progressLabel) {
    const versiones = ["Versión 1.0", "Versión 1.5", "Versión 2.0", "Versión 3.0"];
    let vi = 0;
    const progCard = progressBar.closest(".programador-card");
    if (progressBar) {
      progressBar.addEventListener("click", function (e) {
        e.stopPropagation();
        vi = (vi + 1) % versiones.length;
        progressBar.style.width = ((vi + 1) * 25) + "%";
        progressLabel.textContent = versiones[vi];
      });
    }
  }

  // ==========================================================================
  // MI PRIMER PROGRAMA — demo interactiva (paso 4)
  // ==========================================================================
  const primerBtn = document.getElementById("demo-primer-btn");
  const primerText = document.getElementById("demo-primer-text");
  if (primerBtn && primerText) {
    const msgs = ["Esperando...", "¡Hiciste clic! El código respondió.", "Cada clic ejecuta una función.", "Así funciona la interactividad."];
    let mi = 0;
    primerBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      mi = (mi + 1) % msgs.length;
      primerText.textContent = msgs[mi];
      primerText.style.color = mi > 0 ? "#B85C2A" : "#5E544A";
    });
  }

  // ==========================================================================
  // ANTES / DESPUÉS — slider
  // ==========================================================================
  const adSlider = document.getElementById("ad-slider");
  const adHandle = document.getElementById("ad-handle");
  if (adSlider && adHandle) {
    let adDragging = false;
    function updateAD(x) {
      const rect = adSlider.getBoundingClientRect();
      const pct = Math.max(5, Math.min(95, ((x - rect.left) / rect.width) * 100));
      adSlider.querySelector(".ad-despues").style.clipPath = "inset(0 0 0 " + pct + "%)";
      adHandle.style.left = pct + "%";
    }
    adHandle.addEventListener("pointerdown", function (e) { adDragging = true; adHandle.setPointerCapture(e.pointerId); });
    window.addEventListener("pointermove", function (e) { if (adDragging) updateAD(e.clientX); });
    window.addEventListener("pointerup", function () { adDragging = false; });
    // Init
    updateAD(adSlider.getBoundingClientRect().left + adSlider.offsetWidth * 0.5);
  }

  // ==========================================================================
  // TERMINAL VS VISUAL
  // ==========================================================================
  const tvCmds = document.querySelectorAll(".tv-cmd");
  const tvBox = document.getElementById("tv-box");
  const tvText = document.getElementById("tv-text");
  if (tvCmds.length && tvBox && tvText) {
    tvCmds.forEach(function (cmd) {
      cmd.addEventListener("click", function () {
        tvCmds.forEach(function (c) { c.classList.remove("activo"); });
        cmd.classList.add("activo");
        // Reset base state
        tvBox.style.opacity = "1";
        tvText.style.fontSize = "";
        const accion = cmd.dataset.cmd;
        if (accion === "color") { tvBox.style.background = "#B85C2A"; tvBox.style.color = "#F4EFE4"; tvText.textContent = "Color cambiado a terracota"; }
        else if (accion === "texto") { tvText.textContent = "Hola, Gabriel"; tvBox.style.background = "#FFFFFF"; tvBox.style.color = "#1C1712"; }
        else if (accion === "tamaño") { tvText.textContent = "Texto grande"; tvText.style.fontSize = "1.8rem"; tvBox.style.background = "#FFFFFF"; tvBox.style.color = "#1C1712"; }
        else if (accion === "ocultar") { tvBox.style.opacity = "0"; tvText.textContent = "Elemento oculto"; }
      });
    });
  }

  // ==========================================================================
  // CÓDIGO VS RESULTADO (split view)
  // ==========================================================================
  const crInput = document.getElementById("cr-input");
  const crOutput = document.getElementById("cr-output");
  if (crInput && crOutput) {
    function renderCR() {
      crOutput.innerHTML = crInput.value;
    }
    crInput.addEventListener("input", renderCR);
    renderCR();
  }

  // ==========================================================================
  // SCROLL ZOOM EN "EL FUTURO" (zoom tipo video)
  // ==========================================================================
  const futuroSection = document.getElementById("futuro");
  if (futuroSection) {
    const tablero = futuroSection.querySelector(".tablero");
    if (tablero) {
      let zoomTicking = false;
      window.addEventListener("scroll", function () {
        if (zoomTicking) return;
        zoomTicking = true;
        requestAnimationFrame(function () {
          const rect = futuroSection.getBoundingClientRect();
          const vh = window.innerHeight;
          const progress = Math.max(0, Math.min(1, (vh - rect.top) / (rect.height + vh * 0.5)));
          const scale = 1 + progress * 0.08;
          tablero.style.transform = "scale(" + scale + ")";
          tablero.style.transformOrigin = "center center";
          zoomTicking = false;
        });
      }, { passive: true });
    }
  }

  // ==========================================================================
  // RUTA HORIZONTAL — drag to scroll
  // ==========================================================================
  const rutaScroll = document.getElementById("ruta-scroll");
  if (rutaScroll) {
    let rsDragging = false, rsX = 0, rsScroll = 0;
    rutaScroll.addEventListener("pointerdown", function (e) { if (e.pointerType === "mouse" && e.button !== 0) return; rsDragging = true; rsX = e.clientX; rsScroll = rutaScroll.scrollLeft; rutaScroll.style.cursor = "grabbing"; });
    window.addEventListener("pointermove", function (e) { if (!rsDragging) return; rutaScroll.scrollLeft = rsScroll - (e.clientX - rsX); });
    window.addEventListener("pointerup", function () { rsDragging = false; rutaScroll.style.cursor = "grab"; });
  }

  // ==========================================================================
  // EASTER EGG: Konami Code
  // ==========================================================================
  const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
  let konamiIndex = 0;
  document.addEventListener("keydown", function (e) {
    if (e.keyCode === konamiCode[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        konamiIndex = 0;
        activarEasterEgg();
      }
    } else {
      konamiIndex = 0;
    }
  });
  // También: escribir "gabriel"
  let typed = "";
  document.addEventListener("keydown", function (e) {
    if (e.key && e.key.length === 1) {
      typed += e.key.toLowerCase();
      if (typed.length > 10) typed = typed.slice(-10);
      if (typed.includes("gabriel")) { typed = ""; activarEasterEgg(); }
    }
  });
  function activarEasterEgg() {
    document.body.classList.toggle("easter-egg");
    const msg = document.createElement("div");
    msg.className = "easter-msg";
    msg.textContent = "🎉 Encontraste el código secreto de Gabriel. ¡Así funciona programar!";
    document.body.appendChild(msg);
    setTimeout(function () { msg.classList.add("visible"); }, 50);
    setTimeout(function () { msg.classList.remove("visible"); setTimeout(function () { msg.remove(); }, 400); }, 3000);
  }
})();
