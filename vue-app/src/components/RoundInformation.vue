<template>
  <div class="projects">
    <div class="round-info">
      <div class="image-wrapper">
        <image-responsive title="docking" height="100%" />
      </div>
      <template v-if="currentRound">
        <div class="round">
          <div class="round-title-bar">
            <h2 class="round-title">Ethereum Honduras Grants</h2>
            <v-popover class="verified-container">
              <div class="verified">
                <img src="@/assets/verified.svg" />
              </div>
              <template slot="popover">
                <div class="contract-popover">
                  <div class="contract-address">
                    {{ currentRound.fundingRoundAddress }}
                  </div>
                  <links :to="blockExplorer.url"
                    >Ver en {{ blockExplorer.label }}</links
                  >
                </div>
              </template>
            </v-popover>
          </div>
          <div
            class="status"
            v-if="
              !$store.getters.isRoundFinalized &&
              !$store.getters.isRoundTallying
            "
          >
            <div class="circle open-pulse" />
            Abierto
          </div>
          <div v-else class="status">
            <div class="circle closed" />
            Cerrado
          </div>
        </div>
        <div v-if="isMaxMessagesReached" class="round-notice hidden">
          <span class="bold-all-caps">
            <p>La ronda está oficialmente cerrada</p>
          </span>
          <p>
            ¡Ahora es demasiado tarde para contribuir o reasignar tus
            donaciones! Debido a la generosidad de la comunidad y algunas
            limitaciones técnicas, tuvimos que cerrar la ronda antes de lo
            esperado. Aún puedes ayudar donando al grupo correspondiente.
          </p>
          <div class="dismiss-btn" @click="toggleNotice">Great!</div>
        </div>
        <div class="round-info-item" v-if="$store.getters.isRoundJoinOnlyPhase">
          <div class="full-width">
            <div class="round-info-item-top">
              <div class="round-info-title">⏱️ Apertura de la Ronda</div>
            </div>
          </div>
          <div class="round-info-value">
            <time-left :date="$store.getters.recipientJoinDeadline" />
          </div>
        </div>
        <div
          v-else-if="
            $store.getters.isRoundContributionPhase &&
            !$store.getters.hasUserContributed
          "
          class="round-info-item"
        >
          <div class="full-width">
            <div class="round-info-item-top">
              <div class="round-info-title">
                Tiempo restante para contribuir
              </div>
              <img
                v-tooltip="{
                  content:
                    'Durante esta fase, puedes contribuir a tus proyectos favoritos.',
                  trigger: 'hover click',
                }"
                width="16px"
                src="@/assets/info.svg"
              />
            </div>
          </div>
          <div
            class="round-info-value"
            :title="
              'Fecha limite de Contribución: ' +
              formatDate(currentRound.signUpDeadline)
            "
          >
            <time-left :date="$store.state.currentRound.signUpDeadline" />
          </div>
        </div>
        <div
          v-else-if="
            $store.getters.isRoundReallocationPhase ||
            $store.getters.canUserReallocate
          "
          class="round-info-item"
        >
          <div class="full-width">
            <div class="round-info-item-top">
              <div class="round-info-title">
                {{
                  $store.getters.hasUserContributed
                    ? 'Tiempo restante para reasignar'
                    : 'Estado de la ronda'
                }}
              </div>
              <img
                v-if="$store.getters.hasUserContributed"
                v-tooltip="{
                  content: `Durante esta fase, puedes agregar / eliminar proyectos y cambiar los montos de tus
                  contribuciones. No puedes hacer una contribución o aumentar su total general.`,
                  trigger: 'hover click',
                }"
                width="16px"
                src="@/assets/info.svg"
              />
              <img
                v-else-if="!this.$store.state.currentUser"
                v-tooltip="{
                  content: `Si has contribuido, puedes agregar / eliminar proyectos y cambiar los montos de su contribución. Conecta tu wallet.`,
                  trigger: 'hover click',
                }"
                width="16px"
                src="@/assets/info.svg"
              />
              <img
                v-else
                v-tooltip="{
                  content: `Esta ronda se ha cerrado para nuevas contribuciones.`,
                  trigger: 'hover click',
                }"
                width="16px"
                src="@/assets/info.svg"
              />
            </div>
            <div class="message" v-if="!$store.getters.hasUserContributed">
              Cerrado para contribuciones
            </div>
            <div
              v-else
              class="round-info-value"
              :title="
                'Fecha límite para reasignar: ' +
                formatDate(currentRound.votingDeadline)
              "
            >
              <div class="round-info-value">
                <time-left :date="$store.state.currentRound.votingDeadline" />
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="$store.getters.isRoundTallying" class="round-info-item">
          <div class="full-width">
            <div class="round-info-item-top">
              <div class="round-info-title">Estado de la ronda</div>
              <img
                v-tooltip="{
                  content: `Nuestros contratos inteligentes están ocupados calculando los montos finales de las contribuciones.`,
                  trigger: 'hover click',
                }"
                width="16px"
                src="@/assets/info.svg"
              />
            </div>
            <div class="round-info-value">
              <div class="message">Contando todas las contribuciones</div>
            </div>
          </div>
        </div>
        <div
          v-else-if="$store.getters.isRoundFinalized"
          class="round-info-item"
        >
          <div class="full-width">
            <div class="round-info-item-top">
              <div class="round-info-title">Estado de la ronda</div>
              <img
                v-tooltip="{
                  content: `Si eres propietario de un proyecto, ¡Ahora puedes reclamar tus fondos!`,
                  trigger: 'hover click',
                }"
                width="16px"
                src="@/assets/info.svg"
              />
            </div>
            <div class="round-info-value">
              <div class="message">
                Las contribuciones están listas para ser reclamadas🎉
              </div>
            </div>
          </div>
        </div>
        <div class="round-value-info">
          <div class="round-value-info-item">
            <div class="full-width">
              <div class="round-info-item-top">
                <div class="round-info-title">Total en la ronda</div>
                <img
                  v-tooltip="{
                    content: `Este total incluye los fondos del fondo de contrapartida y todas las contribuciones de la comunidad.`,
                    trigger: 'hover click',
                  }"
                  width="16px"
                  src="@/assets/info.svg"
                />
              </div>
              <div class="round-info-value">
                <div class="value large">{{ formatTotalInRound }}</div>
                <div class="unit">{{ currentRound.nativeTokenSymbol }}</div>
              </div>
            </div>
          </div>
          <div class="round-info-sub-item">
            <div class="round-info-item-top">
              <div class="round-info-title">Pool de Contrapartida</div>
              <img
                v-tooltip="{
                  content:
                    'Estos son los fondos que se distribuirán a todos los proyectos en función de los aportes que reciban de la comunidad.',
                  trigger: 'hover click',
                }"
                width="16px"
                src="@/assets/info.svg"
              />
              <div
                v-if="
                  !$store.getters.isRoundFinalized &&
                  !$store.getters.isRoundTallying
                "
                v-tooltip="'Agregar fondos de contrapartida'"
                class="add-link"
                @click="addMatchingFunds"
              >
                <img src="@/assets/add.svg" width="16px" />
                <span class="add-funds-link">Agregar fondos</span>
              </div>
            </div>

            <div class="round-info-value">
              <div class="value">
                {{ formatAmount(currentRound.matchingPool) }}
              </div>
              <div class="unit">{{ currentRound.nativeTokenSymbol }}</div>
            </div>
          </div>
          <div class="round-info-sub-item">
            <div>
              <div class="round-info-title">Total de Contribuciones</div>
              <div class="round-info-value">
                <div class="value">
                  {{ formatAmount(currentRound.contributions) }}
                </div>
                <div class="unit">{{ currentRound.nativeTokenSymbol }}</div>
              </div>
            </div>
          </div>
          <div class="round-info-sub-item">
            <div>
              <div class="round-info-title">Contribuyentes</div>
              <div class="round-info-value">
                <div class="value">{{ currentRound.contributors }}</div>
                <div class="unit">
                  buidler{{ currentRound.contributors !== 1 ? 's' : '' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-else-if="!currentRound && !isLoading">
        <div class="round-info-item">
          <div class="full-width">
            <div class="round-info-item-top">
              <div class="round-info-title">Sin ronda programada</div>
            </div>
          </div>
          <div class="round-info-value">
            Aún no hemos programado una ronda de financiamiento. Stay tuned!
          </div>
        </div>
      </template>
      <loader v-if="isLoading" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { BigNumber, FixedNumber } from 'ethers'
import { DateTime } from 'luxon'

import { RoundInfo, getCurrentRound } from '@/api/round'
import {
  Project,
  getRecipientRegistryAddress,
  getProjects,
} from '@/api/projects'
import { chain } from '@/api/core'

import { lsGet, lsSet } from '@/utils/localStorage'
import { formatAmount } from '@/utils/amounts'
import ProjectListItem from '@/components/ProjectListItem.vue'
import MatchingFundsModal from '@/components/MatchingFundsModal.vue'
import Loader from '@/components/Loader.vue'
import WalletModal from '@/components/WalletModal.vue'
import TimeLeft from '@/components/TimeLeft.vue'
import Links from '@/components/Links.vue'
import ImageResponsive from '@/components/ImageResponsive.vue'
import {
  SELECT_ROUND,
  LOAD_ROUND_INFO,
  LOAD_USER_INFO,
  LOAD_CART,
  LOAD_COMMITTED_CART,
  LOAD_CONTRIBUTOR_DATA,
} from '@/store/action-types'
import { SET_RECIPIENT_REGISTRY_ADDRESS } from '@/store/mutation-types'

const SHUFFLE_RANDOM_SEED = Math.random()

function random(seed: number, i: number): number {
  // Like Math.random() but seedable
  const s = Math.sin(seed * i) * 10000
  return s - Math.floor(s)
}

function shuffleArray(array: any[]) {
  // Shuffle array using the Durstenfeld algo
  // More info: https://stackoverflow.com/a/12646864/1868395
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random(SHUFFLE_RANDOM_SEED, i) * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

@Component({
  components: {
    ProjectListItem,
    Loader,
    WalletModal,
    TimeLeft,
    Links,
    ImageResponsive,
  },
})
export default class RoundInformation extends Vue {
  projects: Project[] = []
  search = ''
  isLoading = true

  async created() {
    //TODO: update to take factory address as a parameter, default to env. variable
    const roundAddress =
      this.$route.params.address ||
      this.$store.state.currentRoundAddress ||
      (await getCurrentRound())
    if (
      roundAddress &&
      roundAddress !== this.$store.state.currentRoundAddress
    ) {
      // Select round and (re)load round info
      this.$store.dispatch(SELECT_ROUND, roundAddress)
      await this.$store.dispatch(LOAD_ROUND_INFO)
      if (this.$store.state.currentUser) {
        // Load user data if already logged in
        this.$store.dispatch(LOAD_USER_INFO)
        this.$store.dispatch(LOAD_CART)
        this.$store.dispatch(LOAD_COMMITTED_CART)
        this.$store.dispatch(LOAD_CONTRIBUTOR_DATA)
      }
    }
    if (this.$store.state.recipientRegistryAddress === null) {
      const registryAddress = await getRecipientRegistryAddress(roundAddress)
      this.$store.commit(SET_RECIPIENT_REGISTRY_ADDRESS, registryAddress)
    }
    await this.loadProjects()

    // Message cap notice defaults with `hidden` class
    // If it hasn't been dismissed yet, this class is toggled off until dismissed
    const showNotice = !lsGet(this.lsIsNoticeHiddenKey, false)
    if (showNotice) {
      this.toggleNotice()
    }
    this.isLoading = false
  }

  private async loadProjects() {
    const projects = await getProjects(
      this.$store.state.recipientRegistryAddress,
      this.currentRound?.startTime.toSeconds(),
      this.currentRound?.votingDeadline.toSeconds()
    )
    const visibleProjects = projects.filter((project) => {
      return !project.isHidden && !project.isLocked
    })
    shuffleArray(visibleProjects)
    this.projects = visibleProjects
  }

  get currentRound(): RoundInfo | null {
    return this.$store.state.currentRound
  }

  get isMaxMessagesReached(): boolean {
    return this.$store.getters.isMessageLimitReached
  }

  // Gets local storage key to look up if user has dismissed round notice (if message cap exceeded)
  // Key specific to each round via round address
  get lsIsNoticeHiddenKey(): string {
    return `${this.currentRound?.fundingRoundAddress}.is-notice-hidden`
  }

  toggleNotice() {
    const elements = document.getElementsByClassName('round-notice')
    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.toggle('hidden')
    }
    lsSet(this.lsIsNoticeHiddenKey, !lsGet(this.lsIsNoticeHiddenKey))
  }

  get formatTotalInRound(): string {
    const { currentRound } = this.$store.state
    const totalInRound = currentRound.contributions.addUnsafe(
      currentRound.matchingPool
    )

    return this.formatAmount(totalInRound)
  }

  get filteredProjects(): Project[] {
    return this.projects.filter((project: Project) => {
      if (!this.search) {
        return true
      }
      return project.name.toLowerCase().includes(this.search.toLowerCase())
    })
  }

  formatIntegerPart(value: FixedNumber): string {
    if (value._value === '0.0') {
      return '0'
    }
    const integerPart = value.toString().split('.')[0]
    return integerPart + (value.round(0) === value ? '' : '.')
  }

  formatFractionalPart(value: FixedNumber): string {
    return value._value === '0.0' ? '' : value.toString().split('.')[1]
  }

  formatDate(value: DateTime): string {
    return value.toLocaleString(DateTime.DATETIME_SHORT) || ''
  }

  formatAmount(value: BigNumber): string {
    const { nativeTokenDecimals } = this.$store.state.currentRound
    return formatAmount(value, nativeTokenDecimals, 4)
  }

  addMatchingFunds(): void {
    if (!this.$store.state.currentUser) {
      return this.$modal.show(
        WalletModal,
        {},
        { width: 400, top: 20 },
        {
          // If closed but no user was connected in the event, then this will be closing the WalletModal
          // and dont do anythign else. If closed and a user was connected, call the addMatchingFunds method
          // again to pop open the MatchingFundsModal after the WalletModal.
          closed: () => {
            if (this.$store.state.currentUser) {
              this.addMatchingFunds()
            }
          },
        }
      )
    }

    return this.$modal.show(
      MatchingFundsModal,
      {},
      {},
      {
        closed: () => {
          // Reload matching pool size
          this.$store.dispatch(LOAD_ROUND_INFO)
        },
      }
    )
  }

  get blockExplorer(): { label: string; url: string } {
    return {
      label: chain.explorerLabel,
      url: `${chain.explorer}/address/${this.currentRound?.fundingRoundAddress}`,
    }
  }
}
</script>

<style scoped lang="scss">
@import '../styles/vars';
@import '../styles/theme';

.image-wrapper {
  border-radius: 8px;
  background: $clr-pink-dark-gradient;
  height: 160px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.image-wrapper img {
  mix-blend-mode: exclusion;
  transform: rotate(15deg);
}

.round {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.round-title-bar {
  display: flex;
  align-items: center;
}
.round-title {
  line-height: 120%;
  margin: 0;
}

.verified-container {
  align-self: flex-end;
}

.contract-address {
  text-overflow: ellipsis;
  overflow: hidden;
  width: 100%;
  margin-bottom: 0.5rem;
}

.circle {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.closed {
  width: 12px;
  height: 12px;
  background: $bg-light-color;
}

.open-pulse {
  animation: pulse-animation 2s infinite ease-out;
  background: $clr-green;
}

@keyframes pulse-animation {
  0% {
    box-shadow: 0 0 0 0px $bg-primary-color;
  }

  50% {
    box-shadow: 0 0 0 2.5px $clr-green;
  }

  100% {
    box-shadow: 0 0 0 5px $clr-pink;
  }
}

.projects {
  display: flex;
  justify-content: center;
}

.round-info {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 1.5rem;
  margin-top: 1rem;
  max-width: 800px;
  @media (max-width: $breakpoint-m) {
    padding: 1rem;
    padding-bottom: 4rem;
  }
}

.round-value-info {
  width: 100%;
  display: grid;
  align-items: center;
  margin-bottom: 3rem;
  border-radius: 0.5rem;

  img {
    opacity: 0.6;
  }

  & > div {
    box-shadow: inset 0px -1px 0px #7375a6;
    &:first-of-type {
      border-radius: 0.5rem 0.5rem 0 0;
    }
    &:last-of-type {
      border-radius: 0 0 0.5rem 0.5rem;
      box-shadow: none;
    }
  }
}

.round-value-info-item {
  display: flex;
  flex: 1 0 auto;
  justify-content: space-between;
  align-items: center;
  background: $bg-light-color;
  padding: 1rem;
}

.round-info-item {
  display: flex;
  flex-direction: column;
  flex: 1 0 auto;
  justify-content: space-between;
  align-items: flex-start;
  background: $bg-light-color;
  padding: 1rem;
  border-radius: 0.5rem;
  box-sizing: border-box;
  width: 100%;

  img {
    opacity: 0.6;
  }
}

.round-info-item-top {
  width: 100%;
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

.round-info-sub-item {
  flex: 1 0 10%;
  background: $bg-secondary-color;
  padding: 1rem;

  img {
    opacity: 0.6;
  }
}

.round-info-title {
  color: white;
  font-size: 14px;
  font-weight: 400;
  line-height: 120%;
  text-transform: uppercase;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.round-info-value {
  display: flex;
  flex-direction: row;
  align-items: flex-end;

  .value {
    font-size: 24px;
    font-family: 'Glacial Indifference', sans-serif;
    color: white;
    font-weight: 700;
    line-height: 120%;

    &.large {
      font-size: 32px;
      line-height: 120%;
    }

    &.extra {
      font-size: 32px;
      font-family: 'Glacial Indifference', sans-serif;
      color: white;
      line-height: 120%;
    }
  }

  .unit {
    color: white;
    font-family: 'Glacial Indifference', sans-serif;
    font-size: 16px;
    font-weight: 600;
    text-transform: uppercase;
    line-height: 150%;
    margin: 0 0.5rem;

    &:last-child {
      margin-right: 0;
    }
  }
}

.message {
  color: white;
  font-family: 'Glacial Indifference', sans-serif;
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  line-height: 150%;
}

.add-matching-funds-btn {
  display: inline-block;
  margin-left: 5px;

  img {
    height: 1.8em;
    vertical-align: middle;
  }
}

.project-search {
  border: $border;
  border-radius: 30px;
  box-sizing: border-box;
  display: flex;
  margin: 20px 0;
  min-width: 300px;
  padding: 8px 15px;
  width: 33%;

  img {
    margin-right: 10px;
  }

  input {
    background-color: transparent;
    border: none;
    font-size: 14px;
    padding: 0;
    width: 100%;

    &::placeholder {
      opacity: 1;
    }
  }
}

.project-list {
  box-sizing: border-box;
  margin: 100%;

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: $content-space;
}

/* @media (max-width: 1500px) {
  .round-info-item:nth-child(2n) {
    break-after: always;
  }

  .round-info-title {
    margin-bottom: $content-space / 2;
    font-size: 14px;
  }
} */

.add-link {
  display: flex;
  gap: 0.25rem;
  color: $clr-green;
  margin-left: auto;
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
}

.add-funds-link {
  font-size: 14px;
}

.status {
  font-size: 16px;
  display: flex;
  align-items: center;
}

.full-width {
  width: 100%;
}

.round-notice {
  background: $warning-color-bg;
  border: 1px solid $warning-color;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem 1rem;
  color: $warning-color;
  font-size: 14px;
  line-height: 150%;
  font-weight: 500;
  .bold-all-caps {
    text-transform: uppercase;
    font-weight: 600;
  }
  .dismiss-btn {
    @include button($warning-color, none, 1px solid $warning-color);
    margin: 0 auto;
    width: fit-content;
    padding: 0.25rem 1.25rem;
  }
}

.hidden {
  display: none;
}
</style>
