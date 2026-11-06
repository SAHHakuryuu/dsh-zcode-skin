window.__ModuleLoader__.load({
  id: '@local/zcode-skin',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    /** Named theme id, registered so the skin also exists in the theme roster. */
    const THEME_ID = 'zcode';
    /** Token-layer identity for `overrideTokens` (one layer per source). */
    const TOKEN_SOURCE = '@local/zcode-skin';

    /**
     * ZCode palette as a light/dark pair per token, so the skin follows the
     * user's color-scheme preference instead of forcing one look.
     *
     * Dark  — ink canvas with a faint green cast, graphite surfaces, hairline
     *         borders, terminal-emerald accents.
     * Light — paper canvas, white cards, deep-emerald ink for accents.
     */
    const PALETTE = {
      '--dsw-alias-bg-base': { light: '#f4f6f4', dark: '#0a0c0b' },
      '--dsw-alias-bg-layer-1': { light: '#fafbf9', dark: '#0f1311' },
      '--dsw-alias-bg-layer-2': { light: '#eff3ef', dark: '#151b18' },
      '--dsw-alias-bg-layer-3': { light: '#e7ece7', dark: '#1b2420' },
      '--dsw-alias-bg-overlay': { light: '#ffffff', dark: '#0d1110' },
      '--dsw-alias-border-l1': { light: '#dde4dd', dark: '#1e2823' },
      '--dsw-alias-border-l2': { light: '#c4cec6', dark: '#2e3b35' },
      '--dsw-alias-brand-primary': { light: '#0e7a56', dark: '#00a878' },
      // Deeper than the accent so primary buttons keep a readable white label.
      '--dsw-alias-button-primary-fill': { light: '#0e7a56', dark: '#00714d' },
      '--dsw-alias-link': { light: '#0b6b4b', dark: '#35d9a0' },
      '--dsw-alias-label-primary': { light: '#14201a', dark: '#e7eee9' },
      '--dsw-alias-label-secondary': { light: '#55655c', dark: '#94a29a' },
      '--dsw-alias-label-tertiary': { light: '#7a8b81', dark: '#66746d' },
      '--dsw-alias-menu-icon': { light: '#4a5750', dark: '#7f8e86' },
      '--dsw-alias-state-error-primary': { light: '#c43c39', dark: '#f2706f' },
      '--dsw-alias-state-warn-primary': { light: '#a96a12', dark: '#e0a94a' },
      '--dsw-alias-state-success-primary': { light: '#0e7a56', dark: '#35c08b' },
      '--dsw-alias-state-idle-primary': { light: '#9aa8a0', dark: '#5e6b65' },
      '--dsw-alias-state-business-primary': { light: '#0e7a56', dark: '#35d9a0' },
      '--dsw-alias-interactive-bg-hover': { light: '#e8efe9', dark: '#16201b' },
      '--dsw-alias-markdown-code-block': { light: '#eff3ef', dark: '#070a08' },
      '--dsw-specific-sidebar-fill': { light: '#edf1ed', dark: '#0b0f0d' },
    };

    /** Dark-only token map for the registered theme (colorScheme: 'dark'). */
    const DARK_TOKENS = {};
    for (const token of Object.keys(PALETTE)) DARK_TOKENS[token] = PALETTE[token].dark;

    /** Distinct gradient ids so the mark can render more than once per page. */
    let markSeq = 0;

    /**
     * The ZCode mark: an angular Z cut out of a rounded ink tile with a terminal
     * cursor block. Both brand slots share it; its colors are artwork, not theme
     * tokens, so it stays identical in either scheme.
     */
    function ZCodeMark(props) {
      const size = typeof props.size === 'number' && props.size > 0 ? props.size : 24;
      const gradientId = React.useMemo(() => {
        markSeq += 1;
        return 'zcode-mark-' + markSeq;
      }, []);

      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 32 32',
          className: props.className,
          role: 'img',
          'aria-label': 'ZCode',
          style: { display: 'block', flex: 'none' },
        },
        h(
          'defs',
          null,
          h(
            'linearGradient',
            { id: gradientId, x1: '0', y1: '0', x2: '1', y2: '1' },
            h('stop', { offset: '0', stopColor: '#5ce6ac' }),
            h('stop', { offset: '1', stopColor: '#00a878' }),
          ),
        ),
        h('rect', {
          x: 0.75,
          y: 0.75,
          width: 30.5,
          height: 30.5,
          rx: 8.5,
          fill: '#0b100d',
          stroke: '#22302a',
          strokeWidth: 1,
        }),
        h('path', {
          d: 'M10.2 9.6h11.6v2.9l-6.9 6.7h6.9v2.9H10.2v-2.9l6.9-6.7h-6.9z',
          fill: 'url(#' + gradientId + ')',
        }),
        h('rect', {
          x: 21.4,
          y: 20.9,
          width: 2.2,
          height: 4.3,
          rx: 0.5,
          fill: '#5ce6ac',
          opacity: 0.85,
        }),
      );
    }

    /** Run one registration step, reporting a failure instead of aborting apply. */
    function step(label, run) {
      try {
        return run();
      } catch (error) {
        console.error('zcode-skin: ' + label + ' failed', error);
        return () => {};
      }
    }

    return {
      inject: ['slots', 'theme'],
      apply(ctx) {
        // 1. Brand marks. The sidebar mark is a shipped single slot, so it is
        //    shadowed from a lower priority (the lowest rendered registration
        //    wins); the hero mark is an empty seat and needs no shadowing.
        step('sidebar mark', () =>
          ctx.effect(
            () =>
              ctx.slots.inject('sidebar.brand.mark', () =>
                ctx.slots.register({ name: 'sidebar.brand.mark', priority: -1 }, ZCodeMark),
              ),
            'zcode-skin: sidebar mark',
          ),
        );
        step('hero mark', () =>
          ctx.effect(
            () =>
              ctx.slots.inject('conversation.hero.brand.mark', () =>
                ctx.slots.register({ name: 'conversation.hero.brand.mark' }, ZCodeMark),
              ),
            'zcode-skin: hero mark',
          ),
        );

        // 2. The palette: a token layer over the active theme, so every surface
        //    is painted and the skin follows light/dark on its own.
        step('tokens', () =>
          ctx.effect(
            () => ctx.theme.overrideTokens(TOKEN_SOURCE, PALETTE),
            'zcode-skin: tokens',
          ),
        );

        // 3. Also register the skin as a named theme where the roster accepts
        //    third-party ids; the token layer above paints either way.
        step('theme', () =>
          ctx.effect(
            () =>
              ctx.theme.register({
                id: THEME_ID,
                colorScheme: 'dark',
                tokens: DARK_TOKENS,
              }),
            'zcode-skin: theme',
          ),
        );
      },
    };
  },
});
