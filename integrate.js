/*
 * Copyright 2020 Jiří Janoušek <janousek.jiri@gmail.com>
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

(function (Nuvola) {
  const PLAY_SVG = 'M16.032 31.584c-8.64 0-15.616-6.976-15.616-15.616S7.392.416 16.032.416s15.552 6.976 15.552 15.616c0 8.576-6.976 15.552-15.552 15.552zm0-30.08c-8.064 0-14.528 6.464-14.528 14.528S7.968 30.56 16.032 30.56 30.56 24.096 30.56 16.032c-.064-8.064-6.528-14.528-14.528-14.528zm-3.776 8.992l9.568 5.536-9.568 5.536V10.496M11.168 8.64v14.72l12.672-7.328L11.168 8.64z'
  const PAUSE_SVG = 'M16.032 31.584c-8.64 0-15.616-6.976-15.616-15.616S7.392.416 16.032.416s15.552 6.976 15.552 15.616c0 8.576-6.976 15.552-15.552 15.552zm0-30.08c-8.064 0-14.528 6.464-14.528 14.528S7.968 30.56 16.032 30.56 30.56 24.096 30.56 16.032c-.064-8.064-6.528-14.528-14.528-14.528zm-3.776 8.064h1.696v12.864h-1.696V9.568zm5.888 0h1.664v12.864h-1.664V9.568z'

  // Create media player component
  const player = Nuvola.$object(Nuvola.MediaPlayer)

  // Handy aliases
  const PlaybackState = Nuvola.PlaybackState
  const PlayerAction = Nuvola.PlayerAction

  // Create new WebApp prototype
  const WebApp = Nuvola.$WebApp()

  // Initialization routines
  WebApp._onInitWebWorker = function (emitter) {
    Nuvola.WebApp._onInitWebWorker.call(this, emitter)

    const state = document.readyState
    if (state === 'interactive' || state === 'complete') {
      this._onPageReady()
    } else {
      document.addEventListener('DOMContentLoaded', this._onPageReady.bind(this))
    }
  }

  // Page is ready for magic
  WebApp._onPageReady = function () {
    // Connect handler for signal ActionActivated
    Nuvola.actions.connect('ActionActivated', this)

    // Start update routine
    this.update()
  }

  // Extract data from the web page
  WebApp.update = function () {
    const elms = this._getElements()
    const track = {
      title: Nuvola.queryText('.hOOKvw span.oKpSL'),
      artist: Nuvola.queryAttribute('.hOOKvw p.ZSqOQ', 'title'),
      album: Nuvola.queryAttribute('.hOOKvw p.ZSqOQ:last-child', 'title'),
      artLocation: Nuvola.queryAttribute('.hOOKvw img.hFdXsU', 'src'),
      rating: null
    }

    player.setTrack(track)

    let state
    if (elms.pause) {
      state = PlaybackState.PLAYING
    } else if (elms.play) {
      state = PlaybackState.PAUSED
    } else {
      state = PlaybackState.UNKNOWN
    }
    player.setPlaybackState(state)

    player.setCanGoPrev(!!elms.prev)
    player.setCanGoNext(!!elms.next)
    player.setCanPlay(!!elms.play)
    player.setCanPause(!!elms.pause)

    // Schedule the next update
    setTimeout(this.update.bind(this), 500)
  }

  // Handler of playback actions
  WebApp._onActionActivated = function (emitter, name, param) {
    const elms = this._getElements()
    switch (name) {
      case PlayerAction.TOGGLE_PLAY:
        if (elms.play) {
          Nuvola.clickOnElement(elms.play)
        } else {
          Nuvola.clickOnElement(elms.pause)
        }
        break
      case PlayerAction.PLAY:
        Nuvola.clickOnElement(elms.play)
        break
      case PlayerAction.PAUSE:
      case PlayerAction.STOP:
        Nuvola.clickOnElement(elms.pause)
        break
      case PlayerAction.PREV_SONG:
        Nuvola.clickOnElement(elms.prev)
        break
      case PlayerAction.NEXT_SONG:
        Nuvola.clickOnElement(elms.next)
        break
    }
  }

  WebApp._getElements = function () {
  // Interesting elements
    const elms = {
      play: document.querySelector('.hOOKvw button.hrAWUR > svg.jStubB'),
      pause: null,
      next: document.querySelector('.hOOKvw button.ionnrC > svg.betPcV'),
      prev: document.querySelector('.hOOKvw button.ionnrC > svg.cIilyo')
    }

    if (elms.play) {
      const svg = elms.play.firstElementChild.getAttribute('d')
      if (svg === PAUSE_SVG) {
        elms.pause = elms.play
        elms.play = null
      } else if (svg !== PLAY_SVG) {
        elms.play = null
      }
    }

    for (const key in elms) {
      if (elms[key]) {
        // Get parent buttons
        if (elms[key].tagName === 'svg') {
          elms[key] = elms[key].parentElement
        }

        // Ignore disabled buttons
        if (elms[key].disabled) {
          elms[key] = null
        }
      }
    }

    return elms
  }

  WebApp.start()
})(this) // function(Nuvola)
