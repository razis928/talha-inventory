import TextStyle from '@react-pdf/renderer';
import ViewStyle from '@react-pdf/renderer';

export interface TableRowProps {
  data: string[];
  styles: {
    row: ViewStyle;
    cell: TextStyle;
    // borderText?: TextStyle;
    // outerBorder?: ViewStyle;
    // innerBorder?: ViewStyle;
    // content?: TextStyle;
  };
  tableHead?: boolean;
}
