import common from 'govuk-frontend/govuk/common'
import govUkFrontend from 'govuk-frontend/govuk/all'
import AppTabs from './components/tabs'
import SubNavToggle from './components/subnav'
import Accordion from './components/accordion'
import PrintLink from './components/print-link'

const nodeListForEach = common.nodeListForEach

// Initialise tabs
const $tabs = document.querySelectorAll('[data-module~="app-tabs"]')
nodeListForEach($tabs, $tab => {
  new AppTabs($tab).init()
})

// Initialise nav toggles
const $toggles = document.querySelectorAll('[data-module~="subnav-toggle"]')
nodeListForEach($toggles, $toggle => {
  new SubNavToggle($toggle).init()
})

// Initialise language switch
const $languageSwitchExamples = document.querySelectorAll('[data-module~="app-language-switch-example"]')
nodeListForEach($languageSwitchExamples, $example => {
  new LanguageSwitchExample($example).init()
})

// Initialise temporary accordian workaround
const $accordions = document.querySelectorAll('[data-module~="govuk-accordion"]')
nodeListForEach($accordions, $accordion => {
  new Accordion($accordion).init()
})

// Initialise print links
const $printLinks = document.querySelectorAll('[data-module="print-link"')
nodeListForEach($printLinks, $printLink => {
  new PrintLink($printLink).init()
})

govUkFrontend.initAll()
