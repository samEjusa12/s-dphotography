document.addEventListener('DOMContentLoaded', function () {
  const circularNav = document.querySelector('[data-circular-nav]');
  if (!circularNav) {
    return;
  }

  const ring = circularNav.querySelector('[data-ring]');
  const globe = circularNav.querySelector('.circular-nav-globe');
  const items = Array.from(ring.querySelectorAll('.circular-nav-item'));
  const controls = Array.from(circularNav.querySelectorAll('[data-rotate]'));

  const state = {
    rotation: 0,
    tilt: -6,
    velocity: 0,
    tiltVelocity: 0,
    isDragging: false,
    lastX: 0,
    lastY: 0,
    frame: null
  };

  const itemCount = items.length;
  const step = 360 / itemCount;
  const itemProfiles = [
    { angleOffset: 0, latitude: 0, radiusScale: 1, depthOffset: 22 },
    { angleOffset: -84, latitude: -26, radiusScale: 1.02, depthOffset: 4 },
    { angleOffset: 84, latitude: -24, radiusScale: 1.02, depthOffset: 4 },
    { angleOffset: -162, latitude: 30, radiusScale: 1.12, depthOffset: -18 },
    { angleOffset: 162, latitude: 28, radiusScale: 1.12, depthOffset: -18 }
  ];

  function getOrbitMetrics() {
    if (window.innerWidth <= 600) {
      return { radiusX: 158, radiusY: 114, depth: 126 };
    }
    if (window.innerWidth <= 900) {
      return { radiusX: 214, radiusY: 146, depth: 162 };
    }
    return { radiusX: 248, radiusY: 164, depth: 186 };
  }

  function clampTilt(tilt) {
    return Math.max(-34, Math.min(34, tilt));
  }

  function findFrontIndex(metrics) {
    let closestIndex = 0;
    let closestDepth = -Infinity;

    items.forEach(function (_item, index) {
      const profile = itemProfiles[index % itemProfiles.length];
      const azimuth = (index * step + state.rotation + profile.angleOffset) * (Math.PI / 180);
      const latitude = (profile.latitude + state.tilt) * (Math.PI / 180);
      const depth = Math.cos(azimuth) * Math.cos(latitude) * (metrics.depth + profile.depthOffset);

      if (depth > closestDepth) {
        closestDepth = depth;
        closestIndex = index;
      }
    });

    return closestIndex;
  }

  function getTargetRotation(index) {
    const profile = itemProfiles[index % itemProfiles.length];
    return -(index * step + profile.angleOffset);
  }

  function render() {
    const metrics = getOrbitMetrics();
    const frontIndex = findFrontIndex(metrics);

    if (globe) {
      globe.style.setProperty('--globe-spin', (state.rotation * -0.8).toFixed(2) + 'deg');
      globe.style.setProperty('--globe-counter-spin', ((state.rotation * 0.45) + state.tilt * 0.7).toFixed(2) + 'deg');
    }

    items.forEach(function (item, index) {
      const profile = itemProfiles[index % itemProfiles.length];
      const azimuth = (index * step + state.rotation + profile.angleOffset) * (Math.PI / 180);
      const latitude = (profile.latitude + state.tilt) * (Math.PI / 180);
      const orbitScale = profile.radiusScale * Math.cos(latitude);
      const x = Math.sin(azimuth) * metrics.radiusX * orbitScale;
      const y = Math.sin(latitude) * metrics.radiusY;
      const z = Math.cos(azimuth) * Math.cos(latitude) * (metrics.depth + profile.depthOffset);
      const depthRatio = (z + metrics.depth) / (2 * metrics.depth);
      const scale = 0.5 + depthRatio * 0.76;
      const opacity = 0.08 + depthRatio * 0.9;
      const brightness = 0.62 + depthRatio * 0.42;
      const isFront = index === frontIndex;
      const visibility = depthRatio < 0.24 ? 0 : opacity;

      item.classList.toggle('is-front', isFront);
      item.style.transform = 'translate(-50%, -50%) translate3d(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px, ' + z.toFixed(1) + 'px) scale(' + (isFront ? (scale + 0.1) : scale).toFixed(3) + ')';
      item.style.opacity = (isFront ? 1 : visibility).toFixed(3);
      item.style.filter = 'brightness(' + (isFront ? 1.04 : brightness).toFixed(3) + ')';
      item.style.zIndex = String((isFront ? 1200 : 1000) + Math.round(z));
      item.style.pointerEvents = isFront || visibility > 0.2 ? 'auto' : 'none';
    });
  }

  function animateInertia() {
    if (state.isDragging) {
      state.frame = null;
      return;
    }

    state.velocity *= 0.94;
    state.tiltVelocity *= 0.9;

    if (Math.abs(state.velocity) < 0.02 && Math.abs(state.tiltVelocity) < 0.02) {
      state.velocity = 0;
      state.tiltVelocity = 0;
      state.frame = null;
      render();
      return;
    }

    state.rotation += state.velocity;
    state.tilt = clampTilt(state.tilt + state.tiltVelocity);
    render();
    state.frame = requestAnimationFrame(animateInertia);
  }

  function startInertia() {
    if (state.frame) {
      cancelAnimationFrame(state.frame);
    }
    state.frame = requestAnimationFrame(animateInertia);
  }

  function rotateBy(amount) {
    state.rotation += amount;
    render();
    startInertia();
  }

  function onPointerDown(event) {
    state.isDragging = true;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    state.velocity = 0;
    state.tiltVelocity = 0;
    ring.classList.add('is-dragging');

    if (state.frame) {
      cancelAnimationFrame(state.frame);
      state.frame = null;
    }

    ring.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event) {
    if (!state.isDragging) {
      return;
    }

    const deltaX = event.clientX - state.lastX;
    const deltaY = event.clientY - state.lastY;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    state.rotation += deltaX * 0.35;
    state.tilt = clampTilt(state.tilt - deltaY * 0.18);
    state.velocity = deltaX * 0.12;
    state.tiltVelocity = deltaY * -0.05;
    render();
  }

  function onPointerUp(event) {
    if (!state.isDragging) {
      return;
    }

    state.isDragging = false;
    ring.classList.remove('is-dragging');

    try {
      ring.releasePointerCapture(event.pointerId);
    } catch (error) {
      // Ignore pointer capture release issues.
    }

    startInertia();
  }

  ring.addEventListener('pointerdown', onPointerDown);
  ring.addEventListener('pointermove', onPointerMove);
  ring.addEventListener('pointerup', onPointerUp);
  ring.addEventListener('pointercancel', onPointerUp);
  ring.addEventListener('lostpointercapture', onPointerUp);

  circularNav.addEventListener('wheel', function (event) {
    event.preventDefault();
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      state.tiltVelocity += event.deltaY * -0.0014;
      state.tilt = clampTilt(state.tilt + event.deltaY * -0.035);
    } else {
      state.velocity += event.deltaY * -0.0022;
      state.rotation += event.deltaY * -0.08;
    }
    render();
    startInertia();
  }, { passive: false });

  controls.forEach(function (button) {
    button.addEventListener('click', function () {
      const direction = Number(button.getAttribute('data-rotate')) || 0;
      state.velocity = direction * 1.8;
      rotateBy(direction * step);
    });
  });

  items.forEach(function (item) {
    item.addEventListener('click', function (event) {
      const href = item.getAttribute('href') || '';
      const isSamePageHash = href.startsWith('index.html#') || href.startsWith('#');

      if (isSamePageHash) {
        const hash = href.includes('#') ? href.slice(href.indexOf('#')) : href;
        const target = document.querySelector(hash);

        if (target) {
          event.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  window.addEventListener('resize', render);

  render();
});