import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'money',
  standalone: false
})
export class MoneyPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
