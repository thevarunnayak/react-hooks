import React from 'react';
import { TodoLab } from './TodoLab';
import { DebouncedSearchLab } from './DebouncedSearchLab';
import { AutocompleteLab } from './AutocompleteLab';
import { InfiniteScrollLab } from './InfiniteScrollLab';
import { FileUploaderLab } from './FileUploaderLab';
import { ToastSystemLab } from './ToastSystemLab';
import { ModalDialogLab } from './ModalDialogLab';
import { DataTableLab } from './DataTableLab';
import { ImageCarouselLab } from './ImageCarouselLab';
import { MultiStepFormLab } from './MultiStepFormLab';
import { ListVirtualizationLab } from './ListVirtualizationLab';
import { DatePickerLab } from './DatePickerLab';
import { DragDropBoardLab } from './DragDropBoardLab';
import { RealTimeChatLab } from './RealTimeChatLab';
import { PaginationLab } from './PaginationLab';
import { AccordionLab } from './AccordionLab';
import { TabsLab } from './TabsLab';
import { TreeViewLab } from './TreeViewLab';
import { DraggableDashboardLab } from './DraggableDashboardLab';
import { SplitPaneLab } from './SplitPaneLab';
import { BreadcrumbLab } from './BreadcrumbLab';
import { PollVotingLab } from './PollVotingLab';
import { ProductGalleryLab } from './ProductGalleryLab';
import { RichTextEditorLab } from './RichTextEditorLab';
import { CodeEditorLab } from './CodeEditorLab';
import { Card } from '../../ui/Card';

interface MachineCodingLabRunnerProps {
  problemId: string;
}

export const MachineCodingLabRunner: React.FC<MachineCodingLabRunnerProps> = ({ problemId }) => {
  switch (problemId) {
    case 'todo-task-manager':
      return <TodoLab />;
    case 'debounced-search':
      return <DebouncedSearchLab />;
    case 'autocomplete-typeahead':
      return <AutocompleteLab />;
    case 'infinite-scroll':
      return <InfiniteScrollLab />;
    case 'file-uploader':
      return <FileUploaderLab />;
    case 'toast-notification':
      return <ToastSystemLab />;
    case 'modal-dialog':
      return <ModalDialogLab />;
    case 'data-table':
      return <DataTableLab />;
    case 'image-carousel':
      return <ImageCarouselLab />;
    case 'multi-step-form':
      return <MultiStepFormLab />;
    case 'list-virtualization':
      return <ListVirtualizationLab />;
    case 'date-picker':
      return <DatePickerLab />;
    case 'drag-drop-board':
      return <DragDropBoardLab />;
    case 'realtime-chat':
      return <RealTimeChatLab />;
    case 'pagination-component':
      return <PaginationLab />;
    case 'accordion-faq':
      return <AccordionLab />;
    case 'tabs-component':
      return <TabsLab />;
    case 'tree-view-file-explorer':
      return <TreeViewLab />;
    case 'draggable-dashboard':
      return <DraggableDashboardLab />;
    case 'split-pane-resizer':
      return <SplitPaneLab />;
    case 'breadcrumb-navigation':
      return <BreadcrumbLab />;
    case 'poll-voting-system':
      return <PollVotingLab />;
    case 'product-gallery-zoom':
      return <ProductGalleryLab />;
    case 'rich-text-editor':
      return <RichTextEditorLab />;
    case 'code-editor-syntax':
      return <CodeEditorLab />;
    default:
      return (
        <Card variant="glass" padding="lg" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          Interactive lab preview coming soon for this problem.
        </Card>
      );
  }
};
