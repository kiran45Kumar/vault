from django.core.management.base import BaseCommand
from documents.models import Document, DocumentFile


class Command(BaseCommand):
    help = "Migrate old document.file into DocumentFile model"

    def handle(self, *args, **kwargs):

        docs = Document.objects.exclude(file="")

        migrated_count = 0

        for doc in docs:

            already_exists = DocumentFile.objects.filter(
                document=doc,
                file=doc.file.name
            ).exists()

            if not already_exists:

                DocumentFile.objects.create(
                    document=doc,
                    file=doc.file
                )

                migrated_count += 1

                self.stdout.write(
                    self.style.SUCCESS(
                        f"Migrated: {doc.title}"
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"\nMigration completed. Total migrated: {migrated_count}"
            )
        )