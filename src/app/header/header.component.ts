import { Component, OnInit, EventEmitter,Output} from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Output() public onShownSynthButtonClicked = new EventEmitter();
  private isShownSynthButtonClicked : boolean = false;
  constructor() { }

fireEvent(){
  this.onShownSynthButtonClicked.emit(this.isShownSynthButtonClicked);
}

  ngOnInit() {
  }

}
