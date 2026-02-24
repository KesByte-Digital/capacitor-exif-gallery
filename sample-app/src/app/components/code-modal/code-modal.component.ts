import { Component, Input, AfterViewInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import bash from 'highlight.js/lib/languages/bash';

// Register languages
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('bash', bash);

@Component({
  selector: 'app-code-modal',
  templateUrl: './code-modal.component.html',
  styleUrls: ['./code-modal.component.scss'],
  standalone: false,
})
export class CodeModalComponent implements AfterViewInit {
  @Input() title = '';
  @Input() code = '';

  constructor(
    private modalController: ModalController,
    private toastController: ToastController,
  ) {}

  ngAfterViewInit() {
    this.highlightCode();
  }

  private highlightCode() {
    setTimeout(() => {
      document.querySelectorAll('.code-modal-content pre code').forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }, 0);
  }

  async dismiss() {
    await this.modalController.dismiss();
  }

  async copyCode() {
    try {
      await navigator.clipboard.writeText(this.code);

      const toast = await this.toastController.create({
        message: 'Code copied to clipboard!',
        duration: 2000,
        position: 'bottom',
        color: 'success',
        icon: 'checkmark-circle-outline',
      });

      await toast.present();
    } catch (error) {
      const toast = await this.toastController.create({
        message: 'Failed to copy to clipboard',
        duration: 2000,
        position: 'bottom',
        color: 'danger',
        icon: 'close-circle-outline',
      });

      await toast.present();
    }
  }
}
