<template>
  <div>
    <div class="gradient">
      <div class="hero">
        <image-responsive title="core" />
      </div>
    </div>

    <round-status-banner />
    <back-link
      :alsoShowOnMobile="true"
      to="/projects"
      text="← Regresar a proyectos"
    />

    <div class="content" v-if="loading">
      <h1>Cargando data de la ronda...</h1>
      <loader />
    </div>

    <div class="content" v-else-if="$store.getters.hasContributionPhaseEnded">
      <div class="big-emoji">☹</div>
      <h1>Lo sentimos, es demasiado tarde para unirse</h1>
      <div id="subtitle" class="subtitle">
        La ronda está cerrada por nuevos proyectos. Ahora es demasiado tarde
        para subir a bordo.
      </div>
      <div class="subtitle mt2" id="subtitle">
        Mira estas
        <links to="https://ethereum.org/en/community/grants/"
          >otras formas de obtener financiación</links
        >. O síguenos en Twitter para recibir actualizaciones sobre rondas
        futuras :
        <links to="https://twitter.com/EthereumTGU">@EthereumTGU</links>
      </div>
      <div class="btn-container">
        <links to="/" class="btn-primary">Home</links>
      </div>
    </div>

    <div class="content" v-else-if="isRoundFull">
      <div class="big-emoji">☹</div>
      <h1>Lo sentimos, la ronda está llena</h1>
      <div id="subtitle" class="subtitle">
        La tecnología que utilizamos para protegerlo del soborno y la colusión,
        MACI, limita la cantidad de proyectos en este momento.
        Desafortunadamente, hemos llegado al límite y no hay más espacio a
        bordo.
      </div>
      <div class="subtitle mt2" id="subtitle">
        Mira estas
        <links to="https://ethereum.org/en/community/grants/"
          >otras formas de obtener financiación</links
        >. O síguenos en Twitter para recibir actualizaciones sobre rondas
        futuras :
        <links to="https://twitter.com/EthereumTGU">@EthereumTGU</links>
      </div>
      <div class="btn-container">
        <links to="/" class="btn-primary">Home</links>
        <links to="/about" class="btn-secondary">Más sobre MACI</links>
      </div>
    </div>

    <div class="content" v-else-if="$store.state.currentRound">
      <h1>Unite a la ronda de financiamiento</h1>
      <div class="subtitle">
        Necesitaremos información sobre su proyecto y un
        <strong>{{ formatAmount(deposit) }} {{ depositToken }}</strong>
        depósito de seguridad.
      </div>
      <div class="info-boxes">
        <div class="apply-callout">
          <div class="countdown-label caps">Tiempo restante para unirse</div>
          <div class="countdown caps">
            <time-left
              valueClass="none"
              unitClass="none"
              :date="signUpDeadline"
            />
          </div>
        </div>
        <div class="apply-callout">
          <div class="countdown-label caps">Tiempo para completar</div>
          <div class="countdown caps">10 minutos</div>
        </div>
        <div v-if="isRoundFillingUp" class="apply-callout-warning">
          <div class="filling-up-container">
            <div class="countdown caps">
              {{ spacesRemainingString }} quedan, ¡date prisa!
            </div>
            <div class="dropdown">
              <img class="icon" @click="openTooltip" src="@/assets/info.svg" />
              <div id="myTooltip" class="hidden button-menu">
                MACI, nuestra tecnología antisoborno, actualmente limita la
                cantidad de proyectos permitidos por ronda.
                <links to="/about/maci">Más sobre MACI</links>
              </div>
            </div>
          </div>
          <p class="warning-text">
            Recuperarás tu depósito si no entras en la ronda esta vez.
          </p>
        </div>
      </div>
      <div class="btn-container">
        <button class="btn-secondary" @click="toggleCriteria">
          Ver criterios de ronda
        </button>
        <links to="/join/project" class="btn-primary">Agregar proyecto</links>
      </div>
    </div>

    <div class="content" v-else-if="$store.getters.isRoundJoinPhase">
      <h1>Únete a la próxima ronda de financiamiento</h1>
      <div class="subtitle">
        Necesitaremos información sobre su proyecto y un
        <strong>{{ formatAmount(deposit) }} {{ depositToken }}</strong>
        depósito de seguridad.
      </div>
      <div class="info-boxes">
        <div class="apply-callout">
          <div class="countdown-label caps">Tiempo para completar</div>
          <div class="countdown caps">10 minutos</div>
        </div>
      </div>
      <div class="btn-container">
        <button class="btn-secondary" @click="toggleCriteria">
          Ver criterios de ronda
        </button>
        <links to="/join/project" class="btn-primary">Agregar proyecto</links>
      </div>
    </div>

    <criteria-modal v-if="showCriteriaPanel" @close="toggleCriteria" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { DateTime } from 'luxon'
import { BigNumber } from 'ethers'

import { RegistryInfo } from '@/api/recipient-registry-optimistic'
import Loader from '@/components/Loader.vue'
import CriteriaModal from '@/components/CriteriaModal.vue'
import BackLink from '@/components/BackLink.vue'
import Links from '@/components/Links.vue'
import RoundStatusBanner from '@/components/RoundStatusBanner.vue'
import TimeLeft from '@/components/TimeLeft.vue'
import ImageResponsive from '@/components/ImageResponsive.vue'

import { getCurrentRound } from '@/api/round'
import { formatAmount } from '@/utils/amounts'

@Component({
  components: {
    RoundStatusBanner,
    CriteriaModal,
    Loader,
    BackLink,
    Links,
    TimeLeft,
    ImageResponsive,
  },
})
export default class JoinLanding extends Vue {
  currentRound: string | null = null
  loading = true
  showCriteriaPanel = false

  async created() {
    this.currentRound = await getCurrentRound()
    this.loading = false
  }

  get registryInfo(): RegistryInfo {
    return this.$store.state.recipientRegistryInfo
  }

  get deposit(): BigNumber | null {
    return this.registryInfo.deposit
  }

  get depositToken(): string | null {
    return this.registryInfo.depositToken
  }

  get recipientCount(): number | null {
    return this.registryInfo.recipientCount
  }

  private get signUpDeadline(): DateTime {
    return this.$store.state.currentRound?.signUpDeadline
  }

  get spacesRemaining(): number | null {
    if (!this.$store.state.currentRound) {
      return null
    }
    return (
      this.$store.state.currentRound.maxRecipients -
      this.registryInfo.recipientCount
    )
  }

  get isRoundFull(): boolean {
    if (this.spacesRemaining === null) {
      return false
    }
    return (
      this.spacesRemaining === 0 || this.$store.getters.isMessageLimitReached
    )
  }

  get isRoundFillingUp(): boolean {
    if (this.spacesRemaining === null) {
      return false
    }
    return this.spacesRemaining < 20
  }

  get spacesRemainingString(): string {
    return this.spacesRemaining === 1
      ? '1 space'
      : `${this.spacesRemaining} spaces`
  }

  openTooltip(): void {
    document.getElementById('myTooltip')?.classList.toggle('hidden')
  }

  toggleCriteria(): void {
    this.showCriteriaPanel = !this.showCriteriaPanel
  }

  formatAmount(value: BigNumber): string {
    if (!value) return ''
    return formatAmount(value, 18)
  }
}
</script>

<style scoped lang="scss">
@import '../styles/vars';
@import '../styles/theme';

h1 {
  font-family: Glacial Indifference;
  font-style: normal;
  font-weight: bold;
  font-size: 40px;
  line-height: 120%;
}

.gradient {
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 100%;
  background: $clr-pink-dark-gradient;

  .hero {
    position: fixed;
    top: 0;
    right: 0;
    height: 100%;
    width: 100%;
    background: linear-gradient(
      286.78deg,
      rgba(173, 131, 218, 0) -32.78%,
      #191623 78.66%
    );
    @media (max-width: $breakpoint-m) {
      width: 100%;
      padding-bottom: 0rem;
    }

    img {
      position: absolute;
      bottom: 0;
      right: calc(-700px + 50vw);
      mix-blend-mode: exclusion;
      max-width: 88%;
      max-height: 100%;

      @media (max-width: $breakpoint-m) {
        right: 1rem;
        width: 100%;
      }
    }
  }
}

.content {
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  padding: $content-space;
  margin-left: 2rem;
  width: min(100%, 512px);
  @media (max-width: $breakpoint-m) {
    width: 100%;
    margin: 0;
    padding-bottom: 35vw;
  }
}

.countdown {
  font-family: 'Glacial Indifference', sans-serif;
  font-weight: bold;
  font-size: 24px;
  letter-spacing: -0.015em;
}

.countdown-label {
  font-family: Glacial Indifference;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 21px;
  letter-spacing: 6px;
  text-align: left;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 20px;
}

.apply-callout {
  background: $bg-transparent;
  border: 2px solid #9789c4;
  box-sizing: border-box;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  &:first-of-type {
    margin-top: 2rem;
  }
}

.icon {
  width: 16px;
  height: 16px;
}

.apply-callout-warning {
  background: $warning-color-bg;
  border: 2px solid $warning-color;
  box-sizing: border-box;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.filling-up-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.warning-text {
  margin-bottom: 0;
}

.info-boxes {
  margin-bottom: 2rem;
}

.icon-btn {
  padding: 0.5rem;
  &:hover {
    background: $bg-secondary-color;
  }
}

.button-menu {
  flex-direction: column;
  position: absolute;
  top: 2rem;
  right: 0.5rem;
  background: $bg-secondary-color;
  border: 1px solid rgba(115, 117, 166, 0.3);
  border-radius: 0.5rem;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
  cursor: pointer;
  padding: 1rem 0.25rem;
  text-align: center;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.show {
  display: flex;
}

.btn-container {
  margin-top: 2.5rem;
}
</style>
